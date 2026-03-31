"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S7Driver = void 0;
const common_1 = require("@nestjs/common");
const nodes7 = require('nodes7');
class S7Driver {
    logger = new common_1.Logger(S7Driver.name);
    conn = new nodes7();
    connected = false;
    registeredTags = new Map();
    s7AddressMap = new Map();
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
    registerTags(tags) {
        const toAdd = [];
        for (const tag of tags) {
            if (!this.registeredTags.has(tag.id)) {
                const s7Addr = this.transformAddress(tag.address, tag.type);
                this.registeredTags.set(tag.id, tag);
                this.s7AddressMap.set(tag.id, s7Addr);
                toAdd.push(s7Addr);
            }
        }
        if (toAdd.length > 0) {
            this.conn.addItems(toAdd);
            this.logger.log(`📥 Registradas ${toAdd.length} etiquetas variables en la piscina de Nodes7.`);
        }
    }
    async readAllTags() {
        if (!this.connected || this.registeredTags.size === 0)
            return {};
        return new Promise((resolve, reject) => {
            this.conn.readAllItems((err, values) => {
                if (err) {
                    this.logger.error(`Error de red al leer lote: ${err}`);
                    return resolve({});
                }
                const result = {};
                for (const [tagId, s7Addr] of this.s7AddressMap.entries()) {
                    if (values[s7Addr] !== undefined) {
                        result[tagId] = values[s7Addr];
                    }
                }
                resolve(result);
            });
        });
    }
    async readTag(tag) {
        if (!this.connected)
            throw new Error('🔌 Driver no conectado al PLC.');
        if (!this.registeredTags.has(tag.id)) {
            this.registerTags([tag]);
        }
        return new Promise((resolve, reject) => {
            const s7Address = this.s7AddressMap.get(tag.id);
            this.conn.readAllItems((err, values) => {
                if (err)
                    return reject(err);
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
        const firstDot = address.indexOf('.');
        if (firstDot === -1)
            return address;
        const db = address.substring(0, firstDot);
        const offsetPart = address.substring(firstDot + 1);
        const match = offsetPart.match(/(\d+(\.\d+)?)/);
        const offset = match ? match[0] : '0';
        switch (type) {
            case 'BOOL':
                return `${db},X${offset}`;
            case 'INT':
                return `${db},INT${offset}`;
            case 'REAL':
                return `${db},REAL${offset}`;
            case 'WORD':
                return `${db},WORD${offset}`;
            case 'DWORD':
                return `${db},DWORD${offset}`;
            default:
                return `${db},${offset}`;
        }
    }
}
exports.S7Driver = S7Driver;
//# sourceMappingURL=S7Driver.js.map