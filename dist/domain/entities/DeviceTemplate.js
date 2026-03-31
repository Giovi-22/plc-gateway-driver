"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UDT_MOTOR = exports.UDT_REMOTE_CMD = void 0;
exports.UDT_REMOTE_CMD = [
    { key: 'CMD_ID', offset: '0', type: 'INT', isCommand: true },
    { key: 'CMD_CODE', offset: '2', type: 'INT', isCommand: true },
    { key: 'CMD_LAST_ID', offset: '4', type: 'INT', isCommand: true },
];
exports.UDT_MOTOR = [
    { key: 'CMD_LOCAL_START', offset: '0.0', type: 'BOOL' },
    { key: 'CMD_LOCAL_STOP', offset: '0.1', type: 'BOOL' },
    { key: 'ACK_ID', offset: '16', type: 'INT' },
    { key: 'ACK_CODE', offset: '18', type: 'INT' },
    { key: 'ACK_RESULT', offset: '20', type: 'INT' },
    { key: 'CMD_MAINT_START', offset: '8.0', type: 'BOOL' },
    { key: 'CMD_MAINT_STOP', offset: '8.1', type: 'BOOL' },
    { key: 'CMD_MAINT_RESET', offset: '8.2', type: 'BOOL' },
    { key: 'PERM_MAINT_OK', offset: '22.0', type: 'BOOL' },
    { key: 'PERM_TERMICO_OK', offset: '22.2', type: 'BOOL' },
    { key: 'FAIL_CONFIRMATION', offset: '24.0', type: 'BOOL' },
    { key: 'FAIL_TERMICO', offset: '24.1', type: 'BOOL' },
    { key: 'FAIL_GENERAL', offset: '24.2', type: 'BOOL' },
    { key: 'FAIL_TRIP', offset: '24.3', type: 'BOOL' },
    { key: 'CONF_START_TYPE', offset: '28', type: 'INT' },
    { key: 'CONF_STAR_TIME', offset: '30', type: 'TIME' },
    { key: 'CONF_MODE_SELECTED', offset: '48', type: 'INT' },
    { key: 'STAT_RUNNING', offset: '52.0', type: 'BOOL' },
    { key: 'STAT_STOPPED', offset: '52.1', type: 'BOOL' },
    { key: 'STAT_FAULT', offset: '52.2', type: 'BOOL' },
    { key: 'STAT_STARTING', offset: '52.3', type: 'BOOL' },
    { key: 'STAT_STOPPING', offset: '52.4', type: 'BOOL' },
];
//# sourceMappingURL=DeviceTemplate.js.map