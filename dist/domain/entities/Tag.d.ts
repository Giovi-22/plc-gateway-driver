export type SignalType = 'BOOL' | 'INT' | 'REAL' | 'WORD';
export declare class Tag {
    readonly id: string;
    readonly address: string;
    readonly type: SignalType;
    private _value;
    readonly scaling?: {
        minRaw: number;
        maxRaw: number;
        minScaled: number;
        maxScaled: number;
    } | undefined;
    constructor(id: string, address: string, type: SignalType, _value?: number | boolean, scaling?: {
        minRaw: number;
        maxRaw: number;
        minScaled: number;
        maxScaled: number;
    } | undefined);
    get value(): number | boolean;
    updateValue(rawValue: number | boolean): void;
    private scale;
    toJSON(): {
        id: string;
        address: string;
        value: number | boolean;
        type: SignalType;
    };
}
