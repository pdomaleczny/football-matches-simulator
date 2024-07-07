import { Test, TestingModule } from '@nestjs/testing';
import { LiveUpdateService } from '../liveupdates.service';
import { LiveUpdateGateway } from '../liveupdates.gateway';
import { SimulationPayload } from '../../simulations/simulations.payload';
import { SimulationStates } from '../../simulations/simulations.schema';

describe('LiveUpdateService', () => {
  let liveUpdateService: LiveUpdateService;
  let liveUpdateGateway: LiveUpdateGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveUpdateService,
        {
          provide: LiveUpdateGateway,
          useValue: {
            sendToAll: jest.fn(),
          },
        },
      ],
    }).compile();

    liveUpdateService = module.get<LiveUpdateService>(LiveUpdateService);
    liveUpdateGateway = module.get<LiveUpdateGateway>(LiveUpdateGateway);
  });

  it('should be defined', () => {
    expect(liveUpdateService).toBeDefined();
  });

  describe('sendSimulationUpdateToAllClients', () => {
    it('should call sendToAll method of LiveUpdateGateway with correct parameters', () => {
      const mockSimulation: SimulationPayload = {
        name: 'Test Simulation',
        state: SimulationStates.Running,
        games: [],
        startDate: new Date(),
      };

      liveUpdateService.sendSimulationUpdateToAllClients(mockSimulation);

      expect(liveUpdateGateway.sendToAll).toHaveBeenCalledWith(
        'updateSimulation',
        {
          simulation: mockSimulation,
        },
      );
    });

    it('should pass the entire simulation object to sendToAll', () => {
      const mockSimulation: SimulationPayload = {
        name: 'Another Simulation',
        state: SimulationStates.Finished,
        games: [
          {
            homeTeam: 'Team A',
            awayTeam: 'Team B',
            homeGoals: 2,
            awayGoals: 1,
          },
        ],
        startDate: new Date(),
      };

      liveUpdateService.sendSimulationUpdateToAllClients(mockSimulation);

      expect(liveUpdateGateway.sendToAll).toHaveBeenCalledWith(
        'updateSimulation',
        {
          simulation: expect.objectContaining(mockSimulation),
        },
      );
    });
  });
});
