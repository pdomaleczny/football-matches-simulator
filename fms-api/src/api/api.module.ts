import { Module } from '@nestjs/common';
import { SimulationModule } from './simulations/simulations.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    SimulationModule,
    RouterModule.register([
      {
        path: 'simulations',
        module: SimulationModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
