"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const Tag_1 = require("./Tag");
class Device {
    id;
    db;
    baseOffset;
    template;
    tags = [];
    constructor(id, db, baseOffset, template) {
        this.id = id;
        this.db = db;
        this.baseOffset = baseOffset;
        this.template = template;
        this.generateTags();
    }
    generateTags() {
        this.template.forEach(signal => {
            const address = this.calculateAddress(signal.offset);
            this.tags.push(new Tag_1.Tag(`${this.id}_${signal.key}`, address, signal.type === 'TIME' ? 'REAL' : signal.type));
        });
    }
    calculateAddress(offset) {
        const [byte, bit] = offset.split('.');
        const finalByte = this.baseOffset + parseInt(byte);
        if (bit !== undefined) {
            return `DB${this.db}.DBX${finalByte}.${bit}`;
        }
        return `DB${this.db}.DBW${finalByte}`;
    }
    getTags() {
        return this.tags;
    }
}
exports.Device = Device;
//# sourceMappingURL=Device.js.map