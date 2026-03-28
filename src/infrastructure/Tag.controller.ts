import { Controller, Get, Post, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { TagManagerService } from '../application/TagManager.service';

@Controller('devices')
export class TagController {
  constructor(private readonly tagManager: TagManagerService) {}

  @Get()
  getAll() {
    return this.tagManager.getAllDevices();
  }

  @Post()
  async create(@Body() data: any) {
    await this.tagManager.addDevice(data);
    return { success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tagManager.removeDevice(id);
    return { success: true };
  }

  @Post(':id/maintenance/request')
  async request(@Param('id') id: string) {
    await this.tagManager.requestMaintenance(id);
    return { success: true };
  }

  @Post(':id/maintenance/approve')
  async approve(
    @Param('id') id: string,
    @Body('role') role: 'PROD' | 'SUPER'
  ) {
    await this.tagManager.approveMaintenance(id, role);
    return { success: true };
  }

  @Post(':id/maintenance/cancel')
  async cancel(@Param('id') id: string) {
    await this.tagManager.cancelMaintenance(id);
    return { success: true };
  }

  @Post(':id/command')
  async command(
    @Param('id') id: string, 
    @Body('signal') signal: string,
    @Body('value') value: any
  ) {
    try {
      await this.tagManager.writeDeviceCommand(id, signal, value);
      return { success: true };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}




