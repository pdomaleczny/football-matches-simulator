import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrStartNewSimulationDTO } from './simulations.dto';
import { SimulationService } from './simulations.service';
import { SimulationPayload } from './simulations.payload';

@Controller()
export class SimulationsController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get()
  async getCurrentSimulation(): Promise<{
    simulation: SimulationPayload;
  }> {
    const currentSimulation =
      await this.simulationService.getCurrentSimulation();

    return { simulation: currentSimulation };
  }
  @Post()
  async createOrStartSimulation(
    @Body() newSimulation: CreateOrStartNewSimulationDTO,
  ): Promise<{
    simulation: SimulationPayload;
  }> {
    const simulation =
      await this.simulationService.createOrStartNewSimulation(newSimulation);

    return { simulation: simulation };
  }
}
