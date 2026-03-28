export interface SignalTemplate {
  key: string;
  offset: string; // Ej: "32.0" o "14.0"
  type: 'BOOL' | 'INT' | 'REAL' | 'TIME';
}

export const UDT_MOTOR: SignalTemplate[] = [
  // --- COMANDOS (CMD) ---
  { key: 'CMD_LOCAL_START', offset: '0.0', type: 'BOOL' },
  { key: 'CMD_LOCAL_STOP',  offset: '0.1', type: 'BOOL' },
  { key: 'CMD_REMOTE_START', offset: '2.0', type: 'BOOL' },
  { key: 'CMD_REMOTE_STOP',  offset: '2.1', type: 'BOOL' },
  { key: 'CMD_FINAL_START',  offset: '8.0', type: 'BOOL' },
  { key: 'CMD_FINAL_STOP',   offset: '8.1', type: 'BOOL' },

  // --- PERMISOS ---
  { key: 'PERM_MAINT_OK',    offset: '10.0', type: 'BOOL' },
  { key: 'PERM_TERMICO_OK',  offset: '10.2', type: 'BOOL' },

  // --- FALLAS ---
  { key: 'FAIL_CONFIRMATION', offset: '12.0', type: 'BOOL' },
  { key: 'FAIL_TERMICO',      offset: '12.1', type: 'BOOL' },
  { key: 'FAIL_GENERAL',      offset: '12.2', type: 'BOOL' },

  // --- CONFIG ---
  { key: 'CONF_START_TYPE',   offset: '14.0', type: 'INT' },
  { key: 'CONF_STAR_TIME',    offset: '16.0', type: 'TIME' },

  // --- STATUS ---
  { key: 'STAT_RUNNING',      offset: '32.0', type: 'BOOL' },
  { key: 'STAT_STOPPED',      offset: '32.1', type: 'BOOL' },
  { key: 'STAT_FAULT',        offset: '32.2', type: 'BOOL' },
  { key: 'STAT_STARTING',     offset: '32.3', type: 'BOOL' },
  { key: 'STAT_STOPPING',     offset: '32.4', type: 'BOOL' },
  { key: 'STAT_RESERVE',      offset: '34.0', type: 'INT' },
];
