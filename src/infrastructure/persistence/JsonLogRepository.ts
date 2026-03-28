import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'COMMAND' | 'ALARM' | 'MAINTENANCE' | 'SYSTEM';
  deviceId?: string;
  user?: string;
  message: string;
  details?: any;
}

@Injectable()
export class JsonLogRepository {
  private readonly filePath = path.join(process.cwd(), 'data', 'logs.json');

  async getAll(): Promise<LogEntry[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  async save(logs: LogEntry[]): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(logs, null, 2));
  }

  async addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
    const logs = await this.getAll();
    const newEntry: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry); // Newest first
    await this.save(logs.slice(0, 100)); // Keep only last 100 logs for now
    return newEntry;
  }
}
