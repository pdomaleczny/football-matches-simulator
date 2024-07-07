import { PartialType } from '@nestjs/swagger';
import { Simulation } from './simulations.schema';

export class SimulationPayload extends PartialType(Simulation) {
  createdA?: string;
  updateAt?: string;
}
