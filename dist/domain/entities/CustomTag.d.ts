import { Device } from './Device';
export declare class CustomTag extends Device {
    constructor(id: string, db: number, baseOffset: number, dataType: 'BOOL' | 'INT' | 'REAL' | 'TIME');
}
