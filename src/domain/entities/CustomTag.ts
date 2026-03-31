import { Device } from './Device';
import { SignalTemplate } from './DeviceTemplate';

export class CustomTag extends Device {
  constructor(id: string, db: number, baseOffset: number, dataType: 'BOOL' | 'INT' | 'REAL' | 'TIME' | 'WORD' | 'DWORD') {
    // Definimos una plantilla de 1 sola variable al vuelo.
    const isBool = dataType === 'BOOL';
    const singleSignalStr = isBool ? '0.0' : '0'; 

    const dynamicTemplate: SignalTemplate[] = [
      { key: 'VALUE', offset: singleSignalStr, type: dataType as any }
    ];
    
    super(id, db, baseOffset, dynamicTemplate);
  }
}
