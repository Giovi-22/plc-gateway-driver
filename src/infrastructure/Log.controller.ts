import { Controller, Get, Post, Body } from '@nestjs/common';
import { LogManagerService } from '../application/LogManager.service';

@Controller('logs')
export class LogController {
  constructor(private readonly logManager: LogManagerService) {}

  @Get()
  async getAll() {
    return this.logManager.getAllLogs();
  }

  @Post()
  async addNote(@Body('message') message: string, @Body('deviceId') deviceId?: string, @Body('user') user?: string) {
    return this.logManager.addManualEntry(message, deviceId, user);
  }
}
