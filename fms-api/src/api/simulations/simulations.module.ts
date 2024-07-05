import { Module } from '@nestjs/common';
import { SimulationsController } from './simulations.controllers';
import { SimulationService } from './simulations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Simulation, SimulationSchema } from './simulations.schema';
import { GameService } from '../games/games.service';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Simulation.name, schema: SimulationSchema },
    ]),
  ],
  controllers: [SimulationsController],
  providers: [SimulationService, GameService, SchedulerRegistry],
})
export class SimulationsModule {}
