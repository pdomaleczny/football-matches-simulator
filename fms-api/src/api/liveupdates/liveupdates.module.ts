import { Module } from '@nestjs/common';
import { LiveUpdateGateway } from './liveupdates.gateway';
import { LiveUpdateService } from './liveupdates.service';

@Module({
  exports: [LiveUpdateGateway, LiveUpdateService],
  providers: [LiveUpdateGateway, LiveUpdateService],
})
export class LiveUpdateModule {}
