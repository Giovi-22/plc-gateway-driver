export interface LogEntry {
    id: string;
    timestamp: string;
    type: 'COMMAND' | 'ALARM' | 'MAINTENANCE' | 'SYSTEM';
    deviceId?: string;
    user?: string;
    message: string;
    details?: any;
}
export declare class JsonLogRepository {
    private readonly filePath;
    getAll(): Promise<LogEntry[]>;
    save(logs: LogEntry[]): Promise<void>;
    addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry>;
}
