import { Device } from './Device';
import { UDT_MOTOR, UDT_REMOTE_CMD } from './DeviceTemplate';

export class Motor extends Device {
  constructor(
    id: string, 
    db: number, 
    baseOffset: number, 
    commandDb?: number, 
    commandOffset?: number
  ) {
    // Combinamos las señales de estado (DB1) y comandos (DB3)
    super(id, db, baseOffset, [...UDT_MOTOR, ...UDT_REMOTE_CMD], commandDb, commandOffset);
  }
}
