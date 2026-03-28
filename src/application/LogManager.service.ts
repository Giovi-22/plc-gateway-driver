import { Injectable } from '@nestjs/common';
import { JsonLogRepository, LogEntry } from '../infrastructure/persistence/JsonLogRepository';
import { TagGateway } from '../infrastructure/gateways/Tag.gateway';

@Injectable()
export class LogManagerService {
  constructor(
    private readonly repository: JsonLogRepository,
    private readonly gateway: TagGateway
  ) {}

  async getAllLogs(): Promise<LogEntry[]> {
    return this.repository.getAll();
  }

  async logEvent(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const log = await this.repository.addLog(entry);
    this.gateway.server?.emit('logUpdate', log);
    return log;
  }

  async addManualEntry(message: string, deviceId?: string, user?: string) {
    return this.logEvent({
      type: 'SYSTEM',
      message,
      deviceId,
      user
    });
  }
}
