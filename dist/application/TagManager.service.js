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
const Tag_gateway_1 = require("../infrastructure/gateways/Tag.gateway");
const JsonTagRepository_1 = require("../infrastructure/persistence/JsonTagRepository");
let TagManagerService = TagManagerService_1 = class TagManagerService {
    gateway;
    driver;
    repository;
    logger = new common_1.Logger(TagManagerService_1.name);
    devices = new Map();
    maintenanceWorkflows = new Map();
    constructor(gateway, driver, repository) {
        this.gateway = gateway;
        this.driver = driver;
        this.repository = repository;
    }
    async requestMaintenance(deviceId) {
        this.maintenanceWorkflows.set(deviceId, { prodApproved: false, superApproved: false });
        this.broadcastWorkflowState(deviceId);
        this.logger.log(`🛠️ Solicitud de mantenimiento para: ${deviceId}`);
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
        if (wf.prodApproved && wf.superApproved) {
            await this.writeDeviceCommand(deviceId, 'CONF_MODE_SELECTED', 3);
            this.maintenanceWorkflows.delete(deviceId);
            this.logger.log(`✅ ACCESO CONCEDIDO: ${deviceId} en Mantenimiento`);
        }
        this.broadcastWorkflowState(deviceId);
    }
    async cancelMaintenance(deviceId) {
        this.maintenanceWorkflows.delete(deviceId);
        this.broadcastWorkflowState(deviceId);
        this.logger.log(`❌ Solicitud cancelada para: ${deviceId}`);
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
            this.startPolling();
        }
        catch (err) {
            this.logger.error(`Error inicialización: ${err.message}`);
        }
    }
    instantiateDevice(conf) {
        if (conf.type === 'MOTOR') {
            this.devices.set(conf.id, new Motor_1.Motor(conf.id, conf.db, conf.offset));
        }
    }
    async addDevice(conf) {
        this.instantiateDevice(conf);
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
                }
                catch (error) { }
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
        const device = this.devices.get(deviceId);
        if (!device)
            throw new Error('Dispositivo no encontrado');
        const tag = device.getTags().find(t => t.id.endsWith(signalKey));
        if (tag)
            await this.driver.writeTag(tag, value);
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
    __metadata("design:paramtypes", [Tag_gateway_1.TagGateway, Object, JsonTagRepository_1.JsonTagRepository])
], TagManagerService);
//# sourceMappingURL=TagManager.service.js.map