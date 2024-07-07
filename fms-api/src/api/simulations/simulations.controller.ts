import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateOrStartNewSimulationDTO,
  EndSimulationDTO,
} from './simulations.dto';
import { SimulationService } from './simulations.service';
import { SimulationPayload } from './simulations.payload';

interface SimulationResponse {
  simulation: SimulationPayload;
}

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get()
  async getCurrentSimulation(): Promise<SimulationResponse> {
    const currentSimulation =
      await this.simulationService.getCurrentSimulation();

    return this.formatResponse(currentSimulation);
  }

  @Post()
  async createOrStartSimulation(
    @Body() newSimulation: CreateOrStartNewSimulationDTO,
  ): Promise<SimulationResponse> {
    try {
      const simulation =
        await this.simulationService.createOrStartNewSimulation(newSimulation);

      return this.formatResponse(simulation);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Post('end')
  async endSimulation(
    @Body() simulation: EndSimulationDTO,
  ): Promise<SimulationResponse> {
    try {
      const endedSimulation = await this.simulationService.endSimulation(
        simulation.name,
      );

      return this.formatResponse(endedSimulation);
    } catch (error) {
      this.handleError(error);
    }
  }

  private formatResponse(simulation: SimulationPayload): SimulationResponse {
    return { simulation };
  }

  private handleError(error: any): never {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: error.message || 'An unexpected error occurred',
      },
      HttpStatus.BAD_REQUEST,
      {
        cause: error,
      },
    );
  }
}
