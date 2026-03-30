"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S7Driver = void 0;
const common_1 = require("@nestjs/common");
const nodes7 = require('nodes7');
class S7Driver {
    logger = new common_1.Logger(S7Driver.name);
    conn = new nodes7();
    connected = false;
    config = {
        port: 102,
        host: process.env.PLC_HOST || '192.168.0.1',
        rack: Number(process.env.PLC_RACK) || 0,
        slot: Number(process.env.PLC_SLOT) || 2,
    };
    async connect() {
        return new Promise((resolve, reject) => {
            this.logger.log(`Conectando al PLC Siemens en ${this.config.host} (Rack ${this.config.rack}, Slot ${this.config.slot})...`);
            this.conn.initiateConnection(this.config, (err) => {
                if (err) {
                    this.logger.error(`❌ Error de conexión: ${err}`);
                    return reject(err);
                }
                this.connected = true;
                this.logger.log('✅ Conexión establecida con el PLC REAL.');
                resolve();
            });
        });
    }
    async disconnect() {
        return new Promise((resolve) => {
            this.conn.dropConnection(() => {
                this.connected = false;
                resolve();
            });
        });
    }
    async readTag(tag) {
        if (!this.connected)
            throw new Error('🔌 Driver no conectado al PLC.');
        return new Promise((resolve, reject) => {
            const s7Address = this.transformAddress(tag.address, tag.type);
            this.conn.addItems(s7Address);
            this.conn.readAllItems((err, values) => {
                if (err) {
                    this.logger.error(`Error leyendo ${tag.id} (${s7Address}): ${err}`);
                    return reject(err);
                }
                this.conn.removeItems(s7Address);
                resolve(values[s7Address]);
            });
        });
    }
    async writeTag(tag, value) {
        if (!this.connected)
            throw new Error('🔌 Driver no conectado al PLC.');
        return new Promise((resolve, reject) => {
            const s7Address = this.transformAddress(tag.address, tag.type);
            this.conn.writeItems([s7Address], [value], (err) => {
                if (err) {
                    this.logger.error(`Error escribiendo ${tag.id} (${s7Address}): ${err}`);
                    return reject(err);
                }
                resolve();
            });
        });
    }
    isConnected() {
        return this.connected;
    }
    transformAddress(address, type) {
        const parts = address.split('.');
        if (parts.length < 2)
            return address;
        const db = parts[0];
        const offsetPart = parts[1];
        const match = offsetPart.match(/\d+(\.\d+)?/);
        const offset = match ? match[0] : offsetPart;
        switch (type) {
            case 'BOOL':
                return `${db},X${offset}`;
            case 'REAL':
                return `${db},REAL${offset}`;
            case 'INT':
                return `${db},INT${offset}`;
            default:
                return `${db},${offset}`;
        }
    }
}
exports.S7Driver = S7Driver;
//# sourceMappingURL=S7Driver.js.map