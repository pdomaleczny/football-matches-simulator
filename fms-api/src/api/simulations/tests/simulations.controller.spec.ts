import { Test, TestingModule } from '@nestjs/testing';
import { SimulationController } from '../simulations.controller';
import { SimulationService } from '../simulations.service';
import {
  CreateOrStartNewSimulationDTO,
  EndSimulationDTO,
} from '../simulations.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('SimulationsController', () => {
  let controller: SimulationController;
  let simulationService: SimulationService;

  const mockSimulationService = {
    getCurrentSimulation: jest.fn(),
    createOrStartNewSimulation: jest.fn(),
    endSimulation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulationController],
      providers: [
        {
          provide: SimulationService,
          useValue: mockSimulationService,
        },
      ],
    }).compile();

    controller = module.get<SimulationController>(SimulationController);
    simulationService = module.get<SimulationService>(SimulationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentSimulation', () => {
    it('should return the current simulation', async () => {
      const mockSimulation = { id: '1', name: 'Test Simulation' };
      mockSimulationService.getCurrentSimulation.mockResolvedValue(
        mockSimulation,
      );

      const result = await controller.getCurrentSimulation();

      expect(result).toEqual({ simulation: mockSimulation });
      expect(simulationService.getCurrentSimulation).toHaveBeenCalled();
    });
  });

  describe('createOrStartSimulation', () => {
    it('should create or start a new simulation', async () => {
      const dto: CreateOrStartNewSimulationDTO = { name: 'New Simulation' };
      const mockSimulation = { id: '2', name: 'New Simulation' };
      mockSimulationService.createOrStartNewSimulation.mockResolvedValue(
        mockSimulation,
      );

      const result = await controller.createOrStartSimulation(dto);

      expect(result).toEqual({ simulation: mockSimulation });
      expect(simulationService.createOrStartNewSimulation).toHaveBeenCalledWith(
        dto,
      );
    });

    it('should handle errors', async () => {
      const dto: CreateOrStartNewSimulationDTO = { name: 'Error Simulation' };
      mockSimulationService.createOrStartNewSimulation.mockRejectedValue(
        new Error('Test error'),
      );

      await expect(controller.createOrStartSimulation(dto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('endSimulation', () => {
    it('should end a simulation', async () => {
      const dto: EndSimulationDTO = { name: 'End Simulation' };
      const mockSimulation = {
        id: '3',
        name: 'End Simulation',
        state: 'finished',
      };
      mockSimulationService.endSimulation.mockResolvedValue(mockSimulation);

      const result = await controller.endSimulation(dto);

      expect(result).toEqual({ simulation: mockSimulation });
      expect(simulationService.endSimulation).toHaveBeenCalledWith(dto.name);
    });

    it('should handle errors', async () => {
      const dto: EndSimulationDTO = { name: 'Error Simulation' };
      mockSimulationService.endSimulation.mockRejectedValue(
        new Error('Test error'),
      );

      await expect(controller.endSimulation(dto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('error handling', () => {
    it('should throw HttpException with BAD_REQUEST status', () => {
      const error = new Error('Test error');

      expect(() => (controller as any).handleError(error)).toThrow(
        HttpException,
      );
      try {
        (controller as any).handleError(error);
      } catch (e) {
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(e.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Test error',
        });
      }
    });
  });
});
