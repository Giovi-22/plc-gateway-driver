import { Device } from './Device';
import { SignalTemplate } from './DeviceTemplate';

export class CustomTag extends Device {
  constructor(id: string, db: number, baseOffset: number, dataType: 'BOOL' | 'INT' | 'REAL' | 'TIME') {
    // Definimos una plantilla de 1 sola variable al vuelo.
    // Si es BOOL requerimos especificar el bit con '.0', '.1', etc.
    // Por simplicidad, asumimos '.0' para booleanos genéricos a nivel de byte,
    // o simplemente sin bit para variables completas de palabra (INT, REAL).
    const isBool = dataType === 'BOOL';
    const singleSignalStr = isBool ? '0.0' : '0'; 

    const dynamicTemplate: SignalTemplate[] = [
      { key: 'VALUE', offset: singleSignalStr, type: dataType }
    ];
    
    super(id, db, baseOffset, dynamicTemplate);
  }
}
