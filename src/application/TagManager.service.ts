import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Tag } from '../domain/entities/Tag';
import { Motor } from '../domain/entities/Motor';
import { CustomTag } from '../domain/entities/CustomTag';
import { Device } from '../domain/entities/Device';
import { TagGateway } from '../infrastructure/gateways/Tag.gateway';
import type { IPLCDriver } from '../domain/repositories/IPLCDriver';
import { JsonTagRepository, DeviceConfig } from '../infrastructure/persistence/JsonTagRepository';
import { LogManagerService } from './LogManager.service';

@Injectable()
export class TagManagerService implements OnModuleInit {
  private readonly logger = new Logger(TagManagerService.name);
  private readonly devices: Map<string, Device> = new Map();
  private readonly commandCounters: Map<string, number> = new Map(); // Para rastrear CMD_ID por motor
  private readonly pendingAcks: Map<string, number> = new Map(); // Para rastrear confirmaciones (ACK) del PLC

  // 🔐 ALMACÉN DE SOLICITUDES DE MANTENIMIENTO
  private maintenanceWorkflows: Map<string, { prodApproved: boolean, superApproved: boolean }> = new Map();

  constructor(
    private readonly gateway: TagGateway,
    @Inject('PLC_DRIVER') private readonly driver: IPLCDriver,
    private readonly repository: JsonTagRepository,
    private readonly logManager: LogManagerService
  ) {}

  // ... (onModuleInit, etc) ...

  async requestMaintenance(deviceId: string) {
    this.maintenanceWorkflows.set(deviceId, { prodApproved: false, superApproved: false });
    this.broadcastWorkflowState(deviceId);
    this.logger.log(`🛠️ Solicitud de mantenimiento para: ${deviceId}`);
    await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'Solicitud de mantenimiento iniciada' });
  }

  async approveMaintenance(deviceId: string, role: 'PROD' | 'SUPER') {
    const wf = this.maintenanceWorkflows.get(deviceId);
    if (!wf) return;

    if (role === 'PROD') wf.prodApproved = true;
    if (role === 'SUPER') wf.superApproved = true;

    this.logger.log(`✍️ Aprobación ${role} para ${deviceId}`);
    await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: `Aprobación concedida por ${role}` });

    // Solo si AMBOS aprueban, pasamos el PLC a mantenimiento
    if (wf.prodApproved && wf.superApproved) {
      await this.writeDeviceCommand(deviceId, 'CONF_MODE_SELECTED', 2); // 2 = MANTO según DB PLC
      this.maintenanceWorkflows.delete(deviceId);
      this.logger.log(`✅ ACCESO CONCEDIDO: ${deviceId} en Mantenimiento`);
      await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'ACCESO CONCEDIDO - Modo MANTO activo' });
    }

    this.broadcastWorkflowState(deviceId);
  }

  async cancelMaintenance(deviceId: string) {
    this.maintenanceWorkflows.delete(deviceId);
    this.broadcastWorkflowState(deviceId);
    this.logger.log(`❌ Solicitud cancelada para: ${deviceId}`);
    await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'Solicitud cancelada' });
  }

  private broadcastWorkflowState(deviceId: string) {

    const wf = this.maintenanceWorkflows.get(deviceId);
    this.gateway.server?.emit('maintenanceWorkflowUpdate', {
      deviceId,
      pending: !!wf,
      approvals: wf || null
    });
  }


  async onModuleInit() {
    try {
      const configs = await this.repository.getAll();
      configs.forEach(conf => this.instantiateDevice(conf));
      
      this.logger.log(`🏗️  ${this.devices.size} Dispositivos cargados.`);
      
      await this.driver.connect();
      this.startPolling();
    } catch (err) {
      this.logger.error(`Error inicialización: ${err.message}`);
    }
  }

  private instantiateDevice(conf: DeviceConfig) {
    if (conf.type === 'MOTOR') {
      this.devices.set(conf.id, new Motor(conf.id, conf.db, conf.offset));
    } else if (conf.type === 'GENERIC') {
      this.devices.set(conf.id, new CustomTag(conf.id, conf.db, conf.offset, conf.dataType || 'REAL'));
    }
  }

  async addDevice(conf: DeviceConfig) {
    this.instantiateDevice(conf);
    const configs = await this.repository.getAll();
    configs.push(conf);
    await this.repository.save(configs);
    this.logger.log(`➕ Nuevo dispositivo añadido: ${conf.id}`);
  }

  async removeDevice(id: string) {
    this.devices.delete(id);
    const configs = await this.repository.getAll();
    const filtered = configs.filter(c => c.id !== id);
    await this.repository.save(filtered);
    this.logger.log(`🗑️ Dispositivo eliminado: ${id}`);
  }

  private async startPolling() {
    setInterval(async () => {
      for (const device of this.devices.values()) {
        try {
          for (const tag of device.getTags()) {
            const val = await this.driver.readTag(tag);
            tag.updateValue(val);
          }
          
          this.gateway.server?.emit('deviceUpdate', {
            id: device.id,
            state: this.mapDeviceToState(device)
          });

          // 📡 EVALUACIÓN DE ACKs
          const ackIdTag = device.getTags().find(t => t.id.endsWith('ACK_ID'));
          const ackResTag = device.getTags().find(t => t.id.endsWith('ACK_RESULT'));
          
          if (ackIdTag && ackResTag) {
            const pendingId = this.pendingAcks.get(device.id);
            if (pendingId && ackIdTag.value === pendingId) {
              const res = ackResTag.value;
              const resTxt = res === 1 ? 'OK' : res === 2 ? 'RECHAZADA' : res === 3 ? 'INVÁLIDA' : 'DESCONOCIDA';
              
              await this.logManager.logEvent({
                type: 'COMMAND',
                deviceId: device.id,
                message: `Confirmación PLC [ID: ${pendingId}]: Operación ${resTxt}`
              });
              
              this.pendingAcks.delete(device.id); // Limpiar para no repetir
            }
          }
          
        } catch (error) {}
      }
    }, 500);
  }

  private mapDeviceToState(device: Device) {
    const state: any = {};
    device.getTags().forEach(t => {
      const key = t.id.replace(`${device.id}_`, '');
      state[key] = t.value;
    });
    return state;
  }

  async writeDeviceCommand(deviceId: string, signalKey: string, value: any) {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Dispositivo no encontrado');

    // 🧩 PATRÓN DE INTERFAZ POR TRABAJOS (JOB-BASED INTERFACE)
    const commandMap: { [key: string]: number } = {
      'CMD_FINAL_START': 1,
      'CMD_FINAL_STOP': 2,
      'CMD_FINAL_RESET': 3
    };

    if (commandMap[signalKey] !== undefined) {
      // Ignorar eventos 'mouseup' (value = false) antiguos del SCADA Frontend
      if (value === false) return; 

      const cmdCode = commandMap[signalKey];
      
      // Auto-incremento con Rollover (Límite 9999 -> Reseteo a 1)
      let currentId = this.commandCounters.get(deviceId) || 0;
      currentId++;
      if (currentId >= 9999) currentId = 1;
      this.commandCounters.set(deviceId, currentId);

      const tagId = device.getTags().find(t => t.id.endsWith('CMD_ID'));
      const tagCode = device.getTags().find(t => t.id.endsWith('CMD_CODE'));

      if (tagId && tagCode) {
        // Escribe primero el código y luego el disparador (ID)
        await this.driver.writeTag(tagCode, cmdCode);
        await this.driver.writeTag(tagId, currentId);

        await this.logManager.logEvent({
          type: 'COMMAND',
          deviceId,
          message: `Secuencia SCADA [ID: ${currentId}]: Enviando Código ${cmdCode} (${signalKey})`,
          details: { cmdCode, currentId }
        });

        this.pendingAcks.set(deviceId, currentId); // ⏳ Queda a la espera del Polling
      }
      return;
    }

    // Flujo normal para otras señales (ej. CONF_MODE_SELECTED)
    const tag = device.getTags().find(t => t.id.endsWith(signalKey));
    if (tag) {
      await this.driver.writeTag(tag, value);
      await this.logManager.logEvent({
        type: 'COMMAND',
        deviceId,
        message: `Comando enviado: ${signalKey}`,
        details: { value }
      });
    }
  }

  getAllDevices() {
    return Array.from(this.devices.values()).map(d => ({
      id: d.id,
      state: this.mapDeviceToState(d)
    }));
  }
}







