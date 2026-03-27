export type SignalType = 'BOOL' | 'INT' | 'REAL' | 'WORD';

export class Tag {
  constructor(
    public readonly id: string,
    public readonly address: string, // Physical Address (e.g., DB10.DBD0)
    public readonly type: SignalType,
    private _value: number | boolean = 0,
    public readonly scaling?: { minRaw: number; maxRaw: number; minScaled: number; maxScaled: number },
  ) {}

  get value(): number | boolean {
    return this._value;
  }

  updateValue(rawValue: number | boolean) {
    if (typeof rawValue === 'number' && this.scaling) {
      this._value = this.scale(rawValue);
    } else {
      this._value = rawValue;
    }
  }

  private scale(raw: number): number {
    if (!this.scaling) return raw;
    const { minRaw, maxRaw, minScaled, maxScaled } = this.scaling;
    return ((raw - minRaw) / (maxRaw - minRaw)) * (maxScaled - minScaled) + minScaled;
  }

  toJSON() {
    return {
      id: this.id,
      address: this.address,
      value: this._value,
      type: this.type,
    };
  }
}
