import { Module } from '@nestjs/common';
import { TagManagerService } from './application/TagManager.service';
import { LogManagerService } from './application/LogManager.service';
import { TagController } from './infrastructure/Tag.controller';
import { LogController } from './infrastructure/Log.controller';
import { TagGateway } from './infrastructure/gateways/Tag.gateway';
import { PLCDriverFactory } from './infrastructure/drivers/PLCDriver.factory';
import { JsonTagRepository } from './infrastructure/persistence/JsonTagRepository';
import { JsonLogRepository } from './infrastructure/persistence/JsonLogRepository';

@Module({
  imports: [],
  controllers: [TagController, LogController],
  providers: [
    TagManagerService, 
    LogManagerService,
    TagGateway,
    PLCDriverFactory,
    JsonTagRepository,
    JsonLogRepository
  ],
})
export class AppModule {}




