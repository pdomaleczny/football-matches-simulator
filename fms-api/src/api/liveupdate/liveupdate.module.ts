import { Module } from '@nestjs/common';
import { LiveUpdateGateway } from './liveupdate.gateway';
import { LiveUpdateService } from './liveupdate.service';

@Module({
  exports: [LiveUpdateGateway, LiveUpdateService],
  providers: [LiveUpdateGateway, LiveUpdateService],
})
export class LiveUpdateModule {}
