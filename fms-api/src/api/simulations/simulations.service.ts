import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateOrStartNewSimulationDTO } from './simulations.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Simulation, SimulationStates } from './simulations.schema';
import { Model } from 'mongoose';
import { SimulationPayload } from './simulations.payload';
import { GameService } from '../games/games.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LiveUpdateService } from '../liveupdate/liveupdate.service';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  private readonly SIMULATION_DURATION = 10; // seconds
  private readonly INTERVAL_DURATION = 1000; // milliseconds
  private readonly MIN_RESTART_DELAY = 5; // seconds

  constructor(
    @InjectModel(Simulation.name) private simulationModel: Model<Simulation>,
    private readonly gameService: GameService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly liveUpdateService: LiveUpdateService,
  ) {}

  async getCurrentSimulation(): Promise<SimulationPayload> {
    return this.simulationModel.findOne().exec();
  }

  async createOrStartNewSimulation(
    newSimulation: CreateOrStartNewSimulationDTO,
  ): Promise<SimulationPayload> {
    const currentSimulation = await this.getCurrentSimulation();
    if (currentSimulation) {
      return this.handleExistingSimulation(
        currentSimulation,
        newSimulation.name,
      );
    }
    return this.createNewSimulation(newSimulation);
  }

  private async handleExistingSimulation(
    currentSimulation: SimulationPayload,
    newSimulationName: string,
  ): Promise<SimulationPayload> {
    if (this.canRestartSimulation(currentSimulation)) {
      return this.startSimulation(newSimulationName);
    }
    throw new HttpException(
      "Can't run simulation sooner than 5 seconds after previous run",
      HttpStatus.BAD_REQUEST,
    );
  }

  private async createNewSimulation(
    newSimulation: CreateOrStartNewSimulationDTO,
  ): Promise<SimulationPayload> {
    await this.simulationModel.deleteMany({});
    const simulation = new this.simulationModel({
      name: newSimulation.name,
      state: SimulationStates.Ready,
      games: this.gameService.getDefaultGames(),
      startDate: new Date(),
    });
    const savedSimulation = await simulation.save();
    return this.startSimulation(savedSimulation.name);
  }

  private async startSimulation(
    simulationName: string,
  ): Promise<SimulationPayload> {
    let elapsedTime = 0;

    const interval = setInterval(async () => {
      elapsedTime += 1;
      this.logger.warn(
        `Simulation ${simulationName} - seconds left: ${this.SIMULATION_DURATION - elapsedTime}`,
      );
      await this.applyGoalScoringEvent(simulationName);

      if (elapsedTime === this.SIMULATION_DURATION - 1) {
        const simulation = await this.endSimulation(simulationName);
        this.liveUpdateService.sendSimulationUpdateToAllClients(simulation);
      }
    }, this.INTERVAL_DURATION);

    this.schedulerRegistry.addInterval(simulationName, interval);

    return this.simulationModel
      .findOneAndUpdate(
        { name: simulationName },
        {
          state: SimulationStates.Running,
          games: this.gameService.getDefaultGames(),
          startDate: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async endSimulation(simulationName: string): Promise<SimulationPayload> {
    this.schedulerRegistry.deleteInterval(simulationName);
    const simulation = await this.simulationModel
      .findOneAndUpdate(
        { name: simulationName },
        { state: SimulationStates.Finished },
        { new: true },
      )
      .exec();

    this.logEndResults(simulation);
    return simulation;
  }

  private async applyGoalScoringEvent(simulationName: string): Promise<void> {
    this.logger.warn(`Applying scoring event to simulation ${simulationName}`);
    const simulation = await this.simulationModel
      .findOne({ name: simulationName })
      .exec();
    const updatedGames = this.gameService.scoreOneRandomGoal(simulation.games);
    const updatedSimulation = await this.simulationModel
      .findOneAndUpdate(
        { name: simulation.name },
        { games: updatedGames },
        { new: true },
      )
      .exec();
    this.liveUpdateService.sendSimulationUpdateToAllClients(updatedSimulation);
  }

  private canRestartSimulation(simulation: SimulationPayload): boolean {
    const now = new Date();
    const startDate = simulation.startDate;
    const secondsElapsed = (now.getTime() - startDate.getTime()) / 1000;
    return secondsElapsed > this.MIN_RESTART_DELAY;
  }

  private logEndResults(simulation: SimulationPayload): void {
    simulation.games.forEach((game) => {
      this.logger.warn(
        `Game ${game.homeTeam} vs ${game.awayTeam} ended with score ${game.homeGoals} - ${game.awayGoals}!`,
      );
    });
    this.logger.warn(
      `Simulation ${simulation.name} has ended! - ${simulation.state}`,
    );
  }
}
