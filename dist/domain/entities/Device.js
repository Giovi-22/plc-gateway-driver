"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const Tag_1 = require("./Tag");
class Device {
    id;
    db;
    baseOffset;
    template;
    commandDb;
    commandOffset;
    tags = [];
    constructor(id, db, baseOffset, template, commandDb, commandOffset) {
        this.id = id;
        this.db = db;
        this.baseOffset = baseOffset;
        this.template = template;
        this.commandDb = commandDb;
        this.commandOffset = commandOffset;
        this.generateTags();
    }
    generateTags() {
        this.template.forEach(signal => {
            const targetDb = (signal.isCommand && this.commandDb) ? this.commandDb : this.db;
            const targetBase = (signal.isCommand && this.commandOffset !== undefined) ? this.commandOffset : this.baseOffset;
            const address = this.calculateAddress(targetDb, targetBase, signal.offset, signal.type);
            this.tags.push(new Tag_1.Tag(`${this.id}_${signal.key}`, address, signal.type === 'TIME' ? 'REAL' : (signal.type === 'WORD' || signal.type === 'DWORD' ? 'REAL' : signal.type)));
        });
    }
    calculateAddress(db, base, offset, type) {
        const [byte, bit] = offset.split('.');
        const finalByte = base + parseInt(byte);
        if (bit !== undefined) {
            return `DB${db}.DBX${finalByte}.${bit}`;
        }
        const prefix = (type === 'REAL' || type === 'TIME' || type === 'DWORD') ? 'DBD' : 'DBW';
        return `DB${db}.${prefix}${finalByte}`;
    }
    getTags() {
        return this.tags;
    }
}
exports.Device = Device;
//# sourceMappingURL=Device.js.map