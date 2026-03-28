import { Module } from '@nestjs/common';
import { TagManagerService } from './application/TagManager.service';
import { TagController } from './infrastructure/Tag.controller';
import { TagGateway } from './infrastructure/gateways/Tag.gateway';
import { PLCDriverFactory } from './infrastructure/drivers/PLCDriver.factory';
import { JsonTagRepository } from './infrastructure/persistence/JsonTagRepository';

@Module({
  imports: [],
  controllers: [TagController],
  providers: [
    TagManagerService, 
    TagGateway,
    PLCDriverFactory,
    JsonTagRepository, // <-- NUEVO
  ],
})
export class AppModule {}




