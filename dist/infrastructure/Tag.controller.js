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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagController = void 0;
const common_1 = require("@nestjs/common");
const TagManager_service_1 = require("../application/TagManager.service");
let TagController = class TagController {
    tagManager;
    constructor(tagManager) {
        this.tagManager = tagManager;
    }
    getAll() {
        return this.tagManager.getAllDevices();
    }
    async create(data) {
        await this.tagManager.addDevice(data);
        return { success: true };
    }
    async remove(id) {
        await this.tagManager.removeDevice(id);
        return { success: true };
    }
    async request(id) {
        await this.tagManager.requestMaintenance(id);
        return { success: true };
    }
    async approve(id, role) {
        await this.tagManager.approveMaintenance(id, role);
        return { success: true };
    }
    async cancel(id) {
        await this.tagManager.cancelMaintenance(id);
        return { success: true };
    }
    async command(id, signal, value) {
        try {
            await this.tagManager.writeDeviceCommand(id, signal, value);
            return { success: true };
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
};
exports.TagController = TagController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TagController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/maintenance/request'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "request", null);
__decorate([
    (0, common_1.Post)(':id/maintenance/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/maintenance/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/command'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('signal')),
    __param(2, (0, common_1.Body)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TagController.prototype, "command", null);
exports.TagController = TagController = __decorate([
    (0, common_1.Controller)('devices'),
    __metadata("design:paramtypes", [TagManager_service_1.TagManagerService])
], TagController);
//# sourceMappingURL=Tag.controller.js.map