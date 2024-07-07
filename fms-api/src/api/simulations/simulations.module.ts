import { Module } from '@nestjs/common';
import { SimulationController } from './simulations.controller';
import { SimulationService } from './simulations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Simulation, SimulationSchema } from './simulations.schema';
import { GameService } from '../games/games.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LiveUpdateModule } from '../liveupdates/liveupdates.module';

@Module({
  imports: [
    LiveUpdateModule,
    MongooseModule.forFeature([
      { name: Simulation.name, schema: SimulationSchema },
    ]),
  ],
  controllers: [SimulationController],
  providers: [SimulationService, GameService, SchedulerRegistry],
})
export class SimulationModule {}
