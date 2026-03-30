"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTag = void 0;
const Device_1 = require("./Device");
class CustomTag extends Device_1.Device {
    constructor(id, db, baseOffset, dataType) {
        const isBool = dataType === 'BOOL';
        const singleSignalStr = isBool ? '0.0' : '0';
        const dynamicTemplate = [
            { key: 'VALUE', offset: singleSignalStr, type: dataType }
        ];
        super(id, db, baseOffset, dynamicTemplate);
    }
}
exports.CustomTag = CustomTag;
//# sourceMappingURL=CustomTag.js.map