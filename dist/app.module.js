"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const TagManager_service_1 = require("./application/TagManager.service");
const Tag_controller_1 = require("./infrastructure/Tag.controller");
const Tag_gateway_1 = require("./infrastructure/gateways/Tag.gateway");
const PLCDriver_factory_1 = require("./infrastructure/drivers/PLCDriver.factory");
const JsonTagRepository_1 = require("./infrastructure/persistence/JsonTagRepository");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [Tag_controller_1.TagController],
        providers: [
            TagManager_service_1.TagManagerService,
            Tag_gateway_1.TagGateway,
            PLCDriver_factory_1.PLCDriverFactory,
            JsonTagRepository_1.JsonTagRepository,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map