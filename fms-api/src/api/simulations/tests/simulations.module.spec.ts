import { Test, TestingModule } from '@nestjs/testing';
import { SimulationModule } from '../simulations.module';
import { SimulationController } from '../simulations.controller';
import { SimulationService } from '../simulations.service';
import { GameService } from '../../games/games.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { LiveUpdateModule } from '../../liveupdates/liveupdates.module';

// Mock the entire @nestjs/mongoose module
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forFeature: jest.fn().mockReturnValue({
      module: class MockMongooseModule {},
      providers: [],
    }),
  },
  Prop: jest.fn(),
  Schema: jest.fn(),
  SchemaFactory: {
    createForClass: jest.fn(),
  },
}));

// Mock the schema file
jest.mock('../simulations.schema', () => ({
  Simulation: class MockSimulation {},
  SimulationSchema: {},
}));

// Mock the simulation service file
jest.mock('../simulations.service', () => ({
  SimulationService: class MockSimulationService {},
}));

describe('SimulationsModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [SimulationModule],
    })
      .overrideProvider('SimulationModel')
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have SimulationController', () => {
    const controller = module.get<SimulationController>(SimulationController);
    expect(controller).toBeDefined();
  });

  it('should have SimulationService', () => {
    const service = module.get<SimulationService>(SimulationService);
    expect(service).toBeDefined();
  });

  it('should have GameService', () => {
    const service = module.get<GameService>(GameService);
    expect(service).toBeDefined();
  });

  it('should have SchedulerRegistry', () => {
    const schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    expect(schedulerRegistry).toBeDefined();
  });

  it('should import LiveUpdateModule', () => {
    expect(module.get(LiveUpdateModule)).toBeDefined();
  });
});
