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
var TagGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let TagGateway = TagGateway_1 = class TagGateway {
    server;
    logger = new common_1.Logger(TagGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Cliente SCADA conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente SCADA desconectado: ${client.id}`);
    }
    broadcastUpdate(tagId, value) {
        this.server.emit('tagValueUpdate', { id: tagId, value });
    }
};
exports.TagGateway = TagGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TagGateway.prototype, "server", void 0);
exports.TagGateway = TagGateway = TagGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } })
], TagGateway);
//# sourceMappingURL=Tag.gateway.js.map