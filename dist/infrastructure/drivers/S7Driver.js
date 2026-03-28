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
        host: '192.168.0.1',
        rack: 0,
        slot: 2,
    };
    async connect() {
        return new Promise((resolve, reject) => {
            this.logger.log(`Conectando al PLC Siemens en ${this.config.host}...`);
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
            this.conn.readItems([s7Address], (err, values) => {
                if (err)
                    return reject(err);
                resolve(values[s7Address]);
            });
        });
    }
    async writeTag(tag, value) {
        return new Promise((resolve, reject) => {
            const s7Address = this.transformAddress(tag.address, tag.type);
            this.conn.writeItems([s7Address], [value], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    isConnected() {
        return this.connected;
    }
    transformAddress(address, type) {
        let formatted = address.replace(/\./g, ',');
        if (type === 'REAL')
            return formatted.replace('DB', 'REAL');
        if (type === 'BOOL')
            return formatted.replace('DBX', 'X');
        if (type === 'INT')
            return formatted.replace('DBW', 'INT');
        return formatted;
    }
}
exports.S7Driver = S7Driver;
//# sourceMappingURL=S7Driver.js.map