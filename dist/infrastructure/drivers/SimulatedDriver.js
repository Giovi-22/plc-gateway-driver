"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatedDriver = void 0;
const common_1 = require("@nestjs/common");
class SimulatedDriver {
    logger = new common_1.Logger(SimulatedDriver.name);
    connected = false;
    registeredTags = new Map();
    async connect() {
        this.logger.log('Conectando al PLC Simulado...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = true;
                this.logger.log('✅ Conexión establecida con simulador.');
                resolve();
            }, 500);
        });
    }
    async disconnect() {
        this.connected = false;
        this.logger.log('Desconectado del simulador.');
    }
    registerTags(tags) {
        tags.forEach(tag => this.registeredTags.set(tag.id, tag));
        this.logger.log(`📥 [Sim] Registradas ${tags.length} etiquetas.`);
    }
    async readAllTags() {
        const result = {};
        for (const tag of this.registeredTags.values()) {
            result[tag.id] = await this.readTag(tag);
        }
        return result;
    }
    async readTag(tag) {
        if (!this.connected)
            throw new Error('Driver no conectado.');
        if (tag.type === 'BOOL') {
            return Math.random() > 0.5;
        }
        if (tag.type === 'REAL' || tag.type === 'INT') {
            if (tag.scaling) {
                const { minRaw, maxRaw } = tag.scaling;
                return Math.floor(Math.random() * (maxRaw - minRaw + 1)) + minRaw;
            }
            return Math.random() * 1000;
        }
        return 0;
    }
    async writeTag(tag, value) {
        this.logger.log(`Escritura simulada en ${tag.address}: ${value}`);
    }
    isConnected() {
        return this.connected;
    }
}
exports.SimulatedDriver = SimulatedDriver;
//# sourceMappingURL=SimulatedDriver.js.map