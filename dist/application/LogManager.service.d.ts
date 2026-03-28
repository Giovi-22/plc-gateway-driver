import { JsonLogRepository, LogEntry } from '../infrastructure/persistence/JsonLogRepository';
import { TagGateway } from '../infrastructure/gateways/Tag.gateway';
export declare class LogManagerService {
    private readonly repository;
    private readonly gateway;
    constructor(repository: JsonLogRepository, gateway: TagGateway);
    getAllLogs(): Promise<LogEntry[]>;
    logEvent(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry>;
    addManualEntry(message: string, deviceId?: string, user?: string): Promise<LogEntry>;
}
