"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLCDriverFactory = void 0;
const S7Driver_1 = require("./S7Driver");
const SimulatedDriver_1 = require("./SimulatedDriver");
exports.PLCDriverFactory = {
    provide: 'PLC_DRIVER',
    useFactory: () => {
        const useRealPLC = process.env.USE_REAL_PLC === 'true';
        if (useRealPLC) {
            return new S7Driver_1.S7Driver();
        }
        return new SimulatedDriver_1.SimulatedDriver();
    },
};
//# sourceMappingURL=PLCDriver.factory.js.map