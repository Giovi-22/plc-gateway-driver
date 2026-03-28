"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = void 0;
class Tag {
    id;
    address;
    type;
    _value;
    scaling;
    constructor(id, address, type, _value = 0, scaling) {
        this.id = id;
        this.address = address;
        this.type = type;
        this._value = _value;
        this.scaling = scaling;
    }
    get value() {
        return this._value;
    }
    updateValue(rawValue) {
        if (typeof rawValue === 'number' && this.scaling) {
            this._value = this.scale(rawValue);
        }
        else {
            this._value = rawValue;
        }
    }
    scale(raw) {
        if (!this.scaling)
            return raw;
        const { minRaw, maxRaw, minScaled, maxScaled } = this.scaling;
        return ((raw - minRaw) / (maxRaw - minRaw)) * (maxScaled - minScaled) + minScaled;
    }
    toJSON() {
        return {
            id: this.id,
            address: this.address,
            value: this._value,
            type: this.type,
        };
    }
}
exports.Tag = Tag;
//# sourceMappingURL=Tag.js.map