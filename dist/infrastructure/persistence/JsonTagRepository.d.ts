import { OnModuleInit } from '@nestjs/common';
export interface DeviceConfig {
    id: string;
    type: 'MOTOR' | 'VALVE';
    db: number;
    offset: number;
}
export declare class JsonTagRepository implements OnModuleInit {
    private readonly filePath;
    onModuleInit(): Promise<void>;
    getAll(): Promise<DeviceConfig[]>;
    save(devices: DeviceConfig[]): Promise<void>;
}
