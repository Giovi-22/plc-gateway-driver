import { Device } from './Device';
import { UDT_MOTOR } from './DeviceTemplate';

export class Motor extends Device {
  constructor(id: string, db: number, baseOffset: number) {
    super(id, db, baseOffset, UDT_MOTOR);
  }

  // Aquí puedes añadir lógica específica del motor más adelante
  // Ej: motor.getRunningStatus()
}
