import { LogManagerService } from '../application/LogManager.service';
export declare class LogController {
    private readonly logManager;
    constructor(logManager: LogManagerService);
    getAll(): Promise<import("./persistence/JsonLogRepository").LogEntry[]>;
    addNote(message: string, deviceId?: string, user?: string): Promise<import("./persistence/JsonLogRepository").LogEntry>;
}
