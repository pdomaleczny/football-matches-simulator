import { Module } from '@nestjs/common';
import { SimulationsModule } from './simulations/simulations.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    SimulationsModule,
    RouterModule.register([
      {
        path: 'simulations',
        module: SimulationsModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
