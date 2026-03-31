export interface SignalTemplate {
    key: string;
    offset: string;
    type: 'BOOL' | 'INT' | 'REAL' | 'TIME' | 'WORD' | 'DWORD';
    isCommand?: boolean;
}
export declare const UDT_REMOTE_CMD: SignalTemplate[];
export declare const UDT_MOTOR: SignalTemplate[];
