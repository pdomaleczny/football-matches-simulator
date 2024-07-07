import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { HttpException } from '@nestjs/common';

import { Simulation, SimulationStates } from '../simulations.schema';
import { SimulationService } from '../simulations.service';

import { GameService } from '../../games/games.service';
import { LiveUpdateService } from '../../liveupdates/liveupdates.service';

describe('SimulationService', () => {
  let simulationService: SimulationService;
  let module: TestingModule;

  const mockSimulationModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGameService = {
    getDefaultGames: jest.fn().mockReturnValue([]),
    scoreOneRandomGoal: jest.fn(),
  };

  const mockSchedulerRegistry = {
    addInterval: jest.fn(),
    deleteInterval: jest.fn(),
  };

  const mockLiveUpdateService = {
    sendSimulationUpdateToAllClients: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SimulationService,
        {
          provide: getModelToken(Simulation.name),
          useValue: mockSimulationModel,
        },
        {
          provide: GameService,
          useValue: mockGameService,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
        {
          provide: LiveUpdateService,
          useValue: mockLiveUpdateService,
        },
      ],
    }).compile();

    simulationService = module.get<SimulationService>(SimulationService);
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await module.close();
    jest.useRealTimers();
  });

  describe('getCurrentSimulation', () => {
    it('should return the current simulation', async () => {
      const mockSimulation = { name: 'Test Simulation' };
      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSimulation),
      });

      const result = await simulationService.getCurrentSimulation();

      expect(result).toEqual(mockSimulation);
      expect(mockSimulationModel.findOne).toHaveBeenCalled();
    });
  });

  describe('createOrStartNewSimulation', () => {
    it('should create a new simulation if no current simulation exists', async () => {
      const newSimulation = { name: 'New Simulation' };
      const createdSimulation = {
        name: newSimulation.name,
        state: SimulationStates.Ready,
        games: [],
        startDate: expect.any(Date),
      };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockSimulationModel.deleteMany.mockResolvedValue({});
      mockSimulationModel.create.mockResolvedValue(createdSimulation);
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(createdSimulation),
      });

      const result =
        await simulationService.createOrStartNewSimulation(newSimulation);

      expect(result).toEqual(createdSimulation);
      expect(mockSimulationModel.deleteMany).toHaveBeenCalled();
      expect(mockSimulationModel.create).toHaveBeenCalledWith({
        name: newSimulation.name,
        state: SimulationStates.Ready,
        games: expect.any(Array),
        startDate: expect.any(Date),
      });
      expect(mockSimulationModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should start an existing simulation if it can be restarted', async () => {
      const existingSimulation = {
        name: 'Existing Simulation',
        startDate: new Date(Date.now() - 6000), // 6 seconds ago
      };
      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSimulation),
      });
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSimulation),
      });

      const result = await simulationService.createOrStartNewSimulation({
        name: 'New Simulation',
      });

      expect(result).toEqual(existingSimulation);
      expect(mockSimulationModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw an exception if the simulation cannot be restarted', async () => {
      const existingSimulation = {
        name: 'Existing Simulation',
        startDate: new Date(), // Just started
      };
      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSimulation),
      });

      await expect(
        simulationService.createOrStartNewSimulation({
          name: 'New Simulation',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should allow starting a new simulation if more than 5 seconds have passed', async () => {
      const existingSimulation = {
        name: 'Existing Simulation',
        startDate: new Date(Date.now() - 6000), // 6 seconds ago
        state: SimulationStates.Finished,
      };
      const newSimulation = { name: 'New Simulation' };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSimulation),
      });
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...newSimulation,
          state: SimulationStates.Running,
          games: [],
          startDate: expect.any(Date),
        }),
      });

      const result =
        await simulationService.createOrStartNewSimulation(newSimulation);

      expect(result).toEqual(
        expect.objectContaining({
          name: newSimulation.name,
          state: SimulationStates.Running,
        }),
      );
      expect(mockSimulationModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw an exception if trying to start a new simulation within 5 seconds', async () => {
      const existingSimulation = {
        name: 'Existing Simulation',
        startDate: new Date(Date.now() - 3000), // 3 seconds ago
        state: SimulationStates.Finished,
      };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingSimulation),
      });

      await expect(
        simulationService.createOrStartNewSimulation(existingSimulation),
      ).rejects.toThrow(
        "Can't run simulation sooner than 5 seconds after previous run",
      );
    });

    it('should allow starting the first simulation without waiting', async () => {
      const newSimulation = { name: 'First Simulation' };

      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No existing simulation
      });
      mockSimulationModel.create.mockResolvedValue({
        ...newSimulation,
        state: SimulationStates.Ready,
        games: [],
        startDate: expect.any(Date),
      });
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...newSimulation,
          state: SimulationStates.Running,
          games: [],
          startDate: expect.any(Date),
        }),
      });

      const result =
        await simulationService.createOrStartNewSimulation(newSimulation);

      expect(result).toEqual(
        expect.objectContaining({
          name: newSimulation.name,
          state: SimulationStates.Running,
        }),
      );
      expect(mockSimulationModel.create).toHaveBeenCalled();
      expect(mockSimulationModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should enforce 5-second rule across multiple calls', async () => {
      const firstSimulation = { name: 'First Simulation' };
      const secondSimulation = { name: 'Second Simulation' };

      // First call
      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // No existing simulation
      });
      mockSimulationModel.create.mockResolvedValue({
        ...firstSimulation,
        state: SimulationStates.Ready,
        games: [],
        startDate: new Date(),
      });
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstSimulation,
          state: SimulationStates.Running,
          games: [],
          startDate: new Date(),
        }),
      });

      await simulationService.createOrStartNewSimulation(firstSimulation);

      // Second call (immediate)
      mockSimulationModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstSimulation,
          state: SimulationStates.Running,
          games: [],
          startDate: new Date(),
        }),
      });

      await expect(
        simulationService.createOrStartNewSimulation(secondSimulation),
      ).rejects.toThrow(
        "Can't run simulation sooner than 5 seconds after previous run",
      );

      // Third call (after 5 seconds)
      jest.advanceTimersByTime(5000);

      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...secondSimulation,
          state: SimulationStates.Running,
          games: [],
          startDate: expect.any(Date),
        }),
      });

      const result =
        await simulationService.createOrStartNewSimulation(secondSimulation);

      expect(result).toEqual(
        expect.objectContaining({
          name: secondSimulation.name,
          state: SimulationStates.Running,
        }),
      );
    });
  });

  describe('endSimulation', () => {
    it('should end the simulation and update its state', async () => {
      const simulationName = 'Test Simulation';
      const endedSimulation = {
        name: simulationName,
        state: SimulationStates.Finished,
        games: [],
      };
      mockSimulationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(endedSimulation),
      });

      const result = await simulationService.endSimulation(simulationName);

      expect(result).toEqual(endedSimulation);
      expect(mockSchedulerRegistry.deleteInterval).toHaveBeenCalledWith(
        simulationName,
      );
      expect(mockSimulationModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: simulationName },
        { state: SimulationStates.Finished },
        { new: true },
      );
    });
  });
});
