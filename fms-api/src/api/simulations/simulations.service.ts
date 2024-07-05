import { Injectable, Logger } from '@nestjs/common';
import { CreateOrStartNewSimulationDTO } from './simulations.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Simulation, SimulationStates } from './simulations.schema';
import { Model } from 'mongoose';
import { SimulationPayload } from './simulations.payload';
import { GameService } from '../games/games.service';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    @InjectModel(Simulation.name) private simulationModel: Model<Simulation>,
    private readonly gameService: GameService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async getCurrentSimulation(): Promise<SimulationPayload> {
    // await this.simulationModel.deleteMany({});
    const currentSimulation = await this.simulationModel.findOne();
    return currentSimulation;
  }

  async createOrStartNewSimulation(
    newSimulation: CreateOrStartNewSimulationDTO,
  ) {
    const currentSimulation = await this.getCurrentSimulation();
    if (currentSimulation) {
      await this.startSimulation(currentSimulation.name);
      return currentSimulation;
    } else {
      return this.createNewSimulation(newSimulation);
    }
  }

  async createNewSimulation(
    newSimulation: CreateOrStartNewSimulationDTO,
  ): Promise<SimulationPayload> {
    await this.simulationModel.deleteMany({});

    const defaultGamesSetup = this.gameService.getDefaultGames();

    const simulation = new this.simulationModel({
      name: newSimulation.name,
      state: SimulationStates.Ready,
      games: defaultGamesSetup,
    });

    const savedSimulation = await simulation.save();

    await this.startSimulation(savedSimulation.name);

    return savedSimulation;
  }

  async startSimulation(simulationName: string) {
    let time = 0;

    const callback = async () => {
      time += 1;

      this.logger.warn(
        `Interval ${simulationName} executing at time (${1000})! - seconds left: ${
          10 - time
        }`,
      );

      this.applyGoalScoringEvent(simulationName);

      if (time === 9) {
        await this.endSimulation(simulationName);
      }
    };

    const interval = setInterval(callback, 1000);
    this.schedulerRegistry.addInterval(simulationName, interval);

    await this.simulationModel.updateOne(
      { name: simulationName },
      { state: SimulationStates.Running },
    );
  }

  async endSimulation(simulationName: string) {
    this.schedulerRegistry.deleteInterval(simulationName);

    const simulation = await this.simulationModel.findOneAndUpdate(
      { name: simulationName },
      { state: SimulationStates.Finished },
    );

    simulation.games.forEach((game) => {
      this.logger.warn(
        `Game ${game.homeCountryName} vs ${game.awayCountryName} ended with score ${game.homeCountryScore} - ${game.awayCountryScore}!`,
      );
    });

    this.logger.warn(
      `Simulation ${simulation.name} has ended! - ${simulation.state}`,
    );
  }

  async applyGoalScoringEvent(simulationName: string) {
    this.logger.warn(`Applying scoring event to simulation ${simulationName}`);
    const simulation = await this.simulationModel.findOne({
      name: simulationName,
    });
    const updatedGames = this.gameService.scoreOneRandomGoal(simulation.games);
    await this.simulationModel.updateOne(
      { name: simulation.name },
      { games: updatedGames },
    );
  }
}
