import { OnModuleInit } from '@nestjs/common';
import { TagGateway } from '../infrastructure/gateways/Tag.gateway';
import type { IPLCDriver } from '../domain/repositories/IPLCDriver';
import { JsonTagRepository, DeviceConfig } from '../infrastructure/persistence/JsonTagRepository';
import { LogManagerService } from './LogManager.service';
export declare class TagManagerService implements OnModuleInit {
    private readonly gateway;
    private readonly driver;
    private readonly repository;
    private readonly logManager;
    private readonly logger;
    private readonly devices;
    private readonly commandCounters;
    private readonly pendingAcks;
    private maintenanceWorkflows;
    constructor(gateway: TagGateway, driver: IPLCDriver, repository: JsonTagRepository, logManager: LogManagerService);
    requestMaintenance(deviceId: string): Promise<void>;
    approveMaintenance(deviceId: string, role: 'PROD' | 'SUPER'): Promise<void>;
    cancelMaintenance(deviceId: string): Promise<void>;
    private broadcastWorkflowState;
    onModuleInit(): Promise<void>;
    private instantiateDevice;
    addDevice(conf: DeviceConfig): Promise<void>;
    removeDevice(id: string): Promise<void>;
    private startPolling;
    private mapDeviceToState;
    writeDeviceCommand(deviceId: string, signalKey: string, value: any): Promise<void>;
    getAllDevices(): {
        id: string;
        state: any;
    }[];
}
