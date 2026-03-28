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
exports.LogController = void 0;
const common_1 = require("@nestjs/common");
const LogManager_service_1 = require("../application/LogManager.service");
let LogController = class LogController {
    logManager;
    constructor(logManager) {
        this.logManager = logManager;
    }
    async getAll() {
        return this.logManager.getAllLogs();
    }
    async addNote(message, deviceId, user) {
        return this.logManager.addManualEntry(message, deviceId, user);
    }
};
exports.LogController = LogController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('message')),
    __param(1, (0, common_1.Body)('deviceId')),
    __param(2, (0, common_1.Body)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LogController.prototype, "addNote", null);
exports.LogController = LogController = __decorate([
    (0, common_1.Controller)('logs'),
    __metadata("design:paramtypes", [LogManager_service_1.LogManagerService])
], LogController);
//# sourceMappingURL=Log.controller.js.map