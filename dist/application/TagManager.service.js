"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TagManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagManagerService = void 0;
const common_1 = require("@nestjs/common");
const Motor_1 = require("../domain/entities/Motor");
const CustomTag_1 = require("../domain/entities/CustomTag");
const Tag_gateway_1 = require("../infrastructure/gateways/Tag.gateway");
const JsonTagRepository_1 = require("../infrastructure/persistence/JsonTagRepository");
const LogManager_service_1 = require("./LogManager.service");
let TagManagerService = TagManagerService_1 = class TagManagerService {
    gateway;
    driver;
    repository;
    logManager;
    logger = new common_1.Logger(TagManagerService_1.name);
    devices = new Map();
    commandCounters = new Map();
    pendingAcks = new Map();
    maintenanceWorkflows = new Map();
    constructor(gateway, driver, repository, logManager) {
        this.gateway = gateway;
        this.driver = driver;
        this.repository = repository;
        this.logManager = logManager;
    }
    async requestMaintenance(deviceId) {
        this.maintenanceWorkflows.set(deviceId, { prodApproved: false, superApproved: false });
        this.broadcastWorkflowState(deviceId);
        this.logger.log(`🛠️ Solicitud de mantenimiento para: ${deviceId}`);
        await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'Solicitud de mantenimiento iniciada' });
    }
    async approveMaintenance(deviceId, role) {
        const wf = this.maintenanceWorkflows.get(deviceId);
        if (!wf)
            return;
        if (role === 'PROD')
            wf.prodApproved = true;
        if (role === 'SUPER')
            wf.superApproved = true;
        this.logger.log(`✍️ Aprobación ${role} para ${deviceId}`);
        await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: `Aprobación concedida por ${role}` });
        if (wf.prodApproved && wf.superApproved) {
            await this.writeDeviceCommand(deviceId, 'CONF_MODE_SELECTED', 2);
            this.maintenanceWorkflows.delete(deviceId);
            this.logger.log(`✅ ACCESO CONCEDIDO: ${deviceId} en Mantenimiento`);
            await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'ACCESO CONCEDIDO - Modo MANTO activo' });
        }
        this.broadcastWorkflowState(deviceId);
    }
    async cancelMaintenance(deviceId) {
        this.maintenanceWorkflows.delete(deviceId);
        this.broadcastWorkflowState(deviceId);
        this.logger.log(`❌ Solicitud cancelada para: ${deviceId}`);
        await this.logManager.logEvent({ type: 'MAINTENANCE', deviceId, message: 'Solicitud cancelada' });
    }
    broadcastWorkflowState(deviceId) {
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
            this.registerAllTagsInDriver();
            this.startPolling();
        }
        catch (err) {
            this.logger.error(`Error inicialización: ${err.message}`);
        }
    }
    registerAllTagsInDriver() {
        const allTags = [];
        for (const device of this.devices.values()) {
            allTags.push(...device.getTags());
        }
        if (allTags.length > 0) {
            this.driver.registerTags(allTags);
            this.logger.log(`📥 ${allTags.length} tags registrados en el driver PLC.`);
        }
    }
    instantiateDevice(conf) {
        if (conf.type === 'MOTOR') {
            this.devices.set(conf.id, new Motor_1.Motor(conf.id, conf.db, conf.offset));
        }
        else if (conf.type === 'GENERIC') {
            this.devices.set(conf.id, new CustomTag_1.CustomTag(conf.id, conf.db, conf.offset, conf.dataType || 'REAL'));
        }
    }
    async addDevice(conf) {
        this.instantiateDevice(conf);
        const newDevice = this.devices.get(conf.id);
        if (newDevice) {
            this.driver.registerTags(newDevice.getTags());
        }
        const configs = await this.repository.getAll();
        configs.push(conf);
        await this.repository.save(configs);
        this.logger.log(`➕ Nuevo dispositivo añadido: ${conf.id}`);
    }
    async removeDevice(id) {
        this.devices.delete(id);
        const configs = await this.repository.getAll();
        const filtered = configs.filter(c => c.id !== id);
        await this.repository.save(filtered);
        this.logger.log(`🗑️ Dispositivo eliminado: ${id}`);
    }
    async startPolling() {
        this.logger.log('⏱️ Ciclo de polling iniciado (500ms) - MODO BATCH');
        setInterval(async () => {
            try {
                const allValues = await this.driver.readAllTags();
                for (const device of this.devices.values()) {
                    for (const tag of device.getTags()) {
                        if (allValues[tag.id] !== undefined) {
                            tag.updateValue(allValues[tag.id]);
                        }
                    }
                    this.gateway.server?.emit('deviceUpdate', {
                        id: device.id,
                        state: this.mapDeviceToState(device)
                    });
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
                            this.pendingAcks.delete(device.id);
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error en ciclo de polling: ${error.message || error}`);
            }
        }, 500);
    }
    mapDeviceToState(device) {
        const state = {};
        device.getTags().forEach(t => {
            const key = t.id.replace(`${device.id}_`, '');
            state[key] = t.value;
        });
        return state;
    }
    async writeDeviceCommand(deviceId, signalKey, value) {
        this.logger.debug(`📩 COMANDO RECIBIDO: Disp=${deviceId}, Señal=${signalKey}, Valor=${value}`);
        const device = this.devices.get(deviceId);
        if (!device) {
            this.logger.error(`❌ Dispositivo no encontrado: ${deviceId}`);
            throw new Error('Dispositivo no encontrado');
        }
        const commandMap = {
            'CMD_FINAL_START': 1,
            'CMD_FINAL_STOP': 2,
            'CMD_FINAL_RESET': 3
        };
        if (commandMap[signalKey] !== undefined) {
            if (value === false) {
                this.logger.debug(`⏭️ Ignorando mouseup para ${signalKey}`);
                return;
            }
            this.logger.log(`🚀 Ejecutando SECUENCIA DE COMANDO: ${signalKey} (Code=${commandMap[signalKey]}) para ${deviceId}`);
            const cmdCode = commandMap[signalKey];
            let currentId = this.commandCounters.get(deviceId) || 0;
            currentId++;
            if (currentId >= 9999)
                currentId = 1;
            this.commandCounters.set(deviceId, currentId);
            const tagId = device.getTags().find(t => t.id.endsWith('CMD_ID'));
            const tagCode = device.getTags().find(t => t.id.endsWith('CMD_CODE'));
            if (tagId && tagCode) {
                this.logger.debug(`✍️ Escribiendo Código=${cmdCode} e ID=${currentId} en el PLC...`);
                await this.driver.writeTag(tagCode, cmdCode);
                await this.driver.writeTag(tagId, currentId);
                await this.logManager.logEvent({
                    type: 'COMMAND',
                    deviceId,
                    message: `Secuencia SCADA [ID: ${currentId}]: Enviando Código ${cmdCode} (${signalKey})`,
                    details: { cmdCode, currentId }
                });
                this.pendingAcks.set(deviceId, currentId);
            }
            else {
                this.logger.warn(`⚠️ No se encontraron los tags de comando (CMD_ID/CMD_CODE) para ${deviceId}`);
            }
            return;
        }
        this.logger.log(`📝 Escribiendo señal directa: ${signalKey} = ${value}`);
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
        else {
            this.logger.warn(`⚠️ Señal ${signalKey} no definida para dispositivo ${deviceId}`);
        }
    }
    getAllDevices() {
        return Array.from(this.devices.values()).map(d => ({
            id: d.id,
            state: this.mapDeviceToState(d)
        }));
    }
};
exports.TagManagerService = TagManagerService;
exports.TagManagerService = TagManagerService = TagManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PLC_DRIVER')),
    __metadata("design:paramtypes", [Tag_gateway_1.TagGateway, Object, JsonTagRepository_1.JsonTagRepository,
        LogManager_service_1.LogManagerService])
], TagManagerService);
//# sourceMappingURL=TagManager.service.js.map