import { OnModuleInit } from '@nestjs/common';
export interface DeviceConfig {
    id: string;
    type: 'MOTOR' | 'VALVE' | 'GENERIC' | 'SYSTEM';
    db: number;
    offset: number;
    commandDb?: number;
    commandOffset?: number;
    dataType?: 'BOOL' | 'INT' | 'REAL' | 'TIME' | 'WORD' | 'DWORD';
}
export declare class JsonTagRepository implements OnModuleInit {
    private readonly filePath;
    onModuleInit(): Promise<void>;
    getAll(): Promise<DeviceConfig[]>;
    save(devices: DeviceConfig[]): Promise<void>;
}
