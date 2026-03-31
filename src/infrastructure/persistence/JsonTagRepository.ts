import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DeviceConfig {
  id: string;
  type: 'MOTOR' | 'VALVE' | 'GENERIC' | 'SYSTEM';
  db: number;
  offset: number;
  commandDb?: number;     // DB de comandos (DB3)
  commandOffset?: number; // Offset de comandos (indexado cada 6 bytes)
  dataType?: 'BOOL' | 'INT' | 'REAL' | 'TIME' | 'WORD' | 'DWORD';
}

@Injectable()
export class JsonTagRepository implements OnModuleInit {
  private readonly filePath = path.join(process.cwd(), 'devices.json');

  async onModuleInit() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([
        { id: 'MOTOR_TQ_106', type: 'MOTOR', db: 5, offset: 0 }
      ]));
    }
  }

  async getAll(): Promise<DeviceConfig[]> {
    const data = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  async save(devices: DeviceConfig[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(devices, null, 2));
  }
}
