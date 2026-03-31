import { SignalTemplate } from './DeviceTemplate';
import { Tag, SignalType } from './Tag';

export class Device {
  public readonly tags: Tag[] = [];

  constructor(
    public readonly id: string,
    public readonly db: number,
    public readonly baseOffset: number,
    private readonly template: SignalTemplate[], // <-- Ahora inyectamos la plantilla
  ) {
    this.generateTags();
  }

  private generateTags() {
    this.template.forEach(signal => {
      const address = this.calculateAddress(signal.offset, signal.type);
      this.tags.push(new Tag(
        `${this.id}_${signal.key}`, 
        address, 
        signal.type === 'TIME' ? 'REAL' : signal.type as SignalType
      ));
    });
  }

  private calculateAddress(offset: string, type: string): string {
    const [byte, bit] = offset.split('.');
    const finalByte = this.baseOffset + parseInt(byte);
    
    if (bit !== undefined) {
      return `DB${this.db}.DBX${finalByte}.${bit}`;
    }
    
    // REAL y TIME (32 bits) usan DBD. INT (16 bits) usa DBW.
    const prefix = (type === 'REAL' || type === 'TIME') ? 'DBD' : 'DBW';
    return `DB${this.db}.${prefix}${finalByte}`; 
  }

  getTags(): Tag[] {
    return this.tags;
  }
}

