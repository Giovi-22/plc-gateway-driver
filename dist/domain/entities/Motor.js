"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Motor = void 0;
const Device_1 = require("./Device");
const DeviceTemplate_1 = require("./DeviceTemplate");
class Motor extends Device_1.Device {
    constructor(id, db, baseOffset, commandDb, commandOffset) {
        super(id, db, baseOffset, [...DeviceTemplate_1.UDT_MOTOR, ...DeviceTemplate_1.UDT_REMOTE_CMD], commandDb, commandOffset);
    }
}
exports.Motor = Motor;
//# sourceMappingURL=Motor.js.map