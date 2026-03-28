import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Tag } from '../domain/entities/Tag';
import { Motor } from '../domain/entities/Motor';
import { Device } from '../domain/entities/Device';
import { TagGateway } from '../infrastructure/gateways/Tag.gateway';
import type { IPLCDriver } from '../domain/repositories/IPLCDriver';
import { JsonTagRepository, DeviceConfig } from '../infrastructure/persistence/JsonTagRepository';

@Injectable()
export class TagManagerService implements OnModuleInit {
  private readonly logger = new Logger(TagManagerService.name);
  private readonly devices: Map<string, Device> = new Map();
  
  // 🔐 ALMACÉN DE SOLICITUDES DE MANTENIMIENTO
  private maintenanceWorkflows: Map<string, { prodApproved: boolean, superApproved: boolean }> = new Map();

  constructor(
    private readonly gateway: TagGateway,
    @Inject('PLC_DRIVER') private readonly driver: IPLCDriver,
    private readonly repository: JsonTagRepository
  ) {}

  // ... (onModuleInit, etc) ...

  async requestMaintenance(deviceId: string) {
    this.maintenanceWorkflows.set(deviceId, { prodApproved: false, superApproved: false });
    this.broadcastWorkflowState(deviceId);
    this.logger.log(`🛠️ Solicitud de mantenimiento para: ${deviceId}`);
  }

  async approveMaintenance(deviceId: string, role: 'PROD' | 'SUPER') {
    const wf = this.maintenanceWorkflows.get(deviceId);
    if (!wf) return;

    if (role === 'PROD') wf.prodApproved = true;
    if (role === 'SUPER') wf.superApproved = true;

    this.logger.log(`✍️ Aprobación ${role} para ${deviceId}`);

    // Solo si AMBOS aprueban, pasamos el PLC a mantenimiento
    if (wf.prodApproved && wf.superApproved) {
      await this.writeDeviceCommand(deviceId, 'CONF_MODE_SELECTED', 3);
      this.maintenanceWorkflows.delete(deviceId);
      this.logger.log(`✅ ACCESO CONCEDIDO: ${deviceId} en Mantenimiento`);
    }

    this.broadcastWorkflowState(deviceId);
  }

  async cancelMaintenance(deviceId: string) {
    this.maintenanceWorkflows.delete(deviceId);
    this.broadcastWorkflowState(deviceId);
    this.logger.log(`❌ Solicitud cancelada para: ${deviceId}`);
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
    }
    // Aquí puedes añadir: else if (conf.type === 'VALVE') { ... }
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
    const tag = device.getTags().find(t => t.id.endsWith(signalKey));
    if (tag) await this.driver.writeTag(tag, value);
  }

  getAllDevices() {
    return Array.from(this.devices.values()).map(d => ({
      id: d.id,
      state: this.mapDeviceToState(d)
    }));
  }
}







