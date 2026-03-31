import { SignalTemplate } from './DeviceTemplate';
import { Tag, SignalType } from './Tag';

export class Device {
  public readonly tags: Tag[] = [];

  constructor(
    public readonly id: string,
    public readonly db: number,
    public readonly baseOffset: number,
    private readonly template: SignalTemplate[],
    public readonly commandDb?: number,
    public readonly commandOffset?: number
  ) {
    this.generateTags();
  }

  private generateTags() {
    this.template.forEach(signal => {
      // Si la señal es un comando y tenemos un DB/Offset específico de comandos, los usamos.
      const targetDb = (signal.isCommand && this.commandDb) ? this.commandDb : this.db;
      const targetBase = (signal.isCommand && this.commandOffset !== undefined) ? this.commandOffset : this.baseOffset;

      const address = this.calculateAddress(targetDb, targetBase, signal.offset, signal.type);
      
      this.tags.push(new Tag(
        `${this.id}_${signal.key}`, 
        address, 
        signal.type === 'TIME' ? 'REAL' : (signal.type === 'WORD' || signal.type === 'DWORD' ? 'REAL' : signal.type as SignalType)
      ));
    });
  }

  private calculateAddress(db: number, base: number, offset: string, type: string): string {
    const [byte, bit] = offset.split('.');
    const finalByte = base + parseInt(byte);
    
    if (bit !== undefined) {
      return `DB${db}.DBX${finalByte}.${bit}`;
    }
    
    // REAL, TIME, DWORD (32 bits) usan DBD. INT, WORD (16 bits) usan DBW.
    const prefix = (type === 'REAL' || type === 'TIME' || type === 'DWORD') ? 'DBD' : 'DBW';
    return `DB${db}.${prefix}${finalByte}`; 
  }

  getTags(): Tag[] {
    return this.tags;
  }
}

