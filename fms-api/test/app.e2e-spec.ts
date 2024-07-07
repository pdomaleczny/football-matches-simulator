import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';

import { SimulationModule } from '../src/api/simulations/simulations.module';
import { SimulationService } from '../src/api/simulations/simulations.service';
import { SimulationStates } from '../src/api/simulations/simulations.schema';
import { Game } from '../src/api/games/games.schema';

describe('SimulationController (e2e)', () => {
  let app: INestApplication;
  let simulationService: SimulationService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), SimulationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    simulationService = moduleFixture.get<SimulationService>(SimulationService);
    mongoConnection = moduleFixture.get(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(async () => {
    if (mongoConnection) {
      await mongoConnection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  describe('POST / (Start Simulation)', () => {
    it('should start a new simulation with a valid name', async () => {
      const newSimulation = { name: 'Katar 2023' };
      const mockCreatedSimulation = {
        ...newSimulation,
        state: SimulationStates.Running,
        games: [],
        startDate: new Date(),
      };
      jest
        .spyOn(simulationService, 'createOrStartNewSimulation')
        .mockResolvedValue(mockCreatedSimulation);

      const response = await request(app.getHttpServer())
        .post('/')
        .send(newSimulation)
        .expect(201);

      expect(response.body.simulation).toMatchObject({
        name: mockCreatedSimulation.name,
        state: mockCreatedSimulation.state,
        games: mockCreatedSimulation.games,
      });
      expect(new Date(response.body.simulation.startDate)).toBeInstanceOf(Date);
    });

    it('should reject a simulation name that is too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/')
        .send({ name: 'Short' })
        .expect(400);

      expect(response.body.message).toContain(
        'Name must be at least 8 characters long',
      );
    });

    it('should reject a simulation name that is too long', async () => {
      const response = await request(app.getHttpServer())
        .post('/')
        .send({ name: 'This simulation name is way too long to be valid' })
        .expect(400);

      expect(response.body.message).toContain(
        'Name cannot be longer than 30 characters',
      );
    });

    it('should reject a simulation name with invalid characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/')
        .send({ name: 'Invalid!Name@123' })
        .expect(400);

      expect(response.body.message).toContain(
        'Name must contain only alphanumeric characters and spaces',
      );
    });
  });

  describe('POST /end (End Simulation)', () => {
    it('should allow manually ending a simulation before 9 seconds', async () => {
      const simulationToEnd = { name: 'Early End Test' };
      const mockEndedSimulation = {
        ...simulationToEnd,
        state: SimulationStates.Finished,
        games: [],
        startDate: new Date(Date.now() - 5000), // 5 seconds ago
      };
      jest
        .spyOn(simulationService, 'endSimulation')
        .mockResolvedValue(mockEndedSimulation);

      const response = await request(app.getHttpServer())
        .post('/end')
        .send(simulationToEnd)
        .expect(201);

      expect(response.body.simulation).toMatchObject({
        name: mockEndedSimulation.name,
        state: mockEndedSimulation.state,
        games: mockEndedSimulation.games,
      });
      expect(new Date(response.body.simulation.startDate)).toBeInstanceOf(Date);
      expect(
        new Date(response.body.simulation.startDate).getTime(),
      ).toBeLessThan(Date.now() - 4000);
    });

    it('should automatically end a simulation after 9 seconds', async () => {
      jest.useFakeTimers();
      const simulationName = 'Auto End Test';
      const mockSimulation = {
        name: simulationName,
        state: SimulationStates.Running,
        games: [],
        startDate: new Date(),
      };
      jest
        .spyOn(simulationService, 'createOrStartNewSimulation')
        .mockResolvedValue(mockSimulation);
      jest
        .spyOn(simulationService, 'getCurrentSimulation')
        .mockImplementation(() => {
          return Promise.resolve({
            ...mockSimulation,
            state:
              Date.now() - mockSimulation.startDate.getTime() >= 9000
                ? SimulationStates.Finished
                : SimulationStates.Running,
          });
        });

      await request(app.getHttpServer())
        .post('/')
        .send({ name: simulationName })
        .expect(201);

      jest.advanceTimersByTime(8999);
      let response = await request(app.getHttpServer()).get('/').expect(200);
      expect(response.body.simulation.state).toBe(SimulationStates.Running);

      jest.advanceTimersByTime(1);
      response = await request(app.getHttpServer()).get('/').expect(200);
      expect(response.body.simulation.state).toBe(SimulationStates.Finished);

      jest.useRealTimers();
    }, 10000); // Increase timeout for this test
  });

  describe('Goal Scoring', () => {
    it('should score a goal every second for 9 seconds', async () => {
      jest.useFakeTimers();
      const simulationName = 'Goal Scoring Test';
      const games: Game[] = [
        { homeTeam: 'Team A', homeGoals: 0, awayTeam: 'Team B', awayGoals: 0 },
      ];

      jest
        .spyOn(simulationService, 'createOrStartNewSimulation')
        .mockResolvedValue({
          name: simulationName,
          state: SimulationStates.Running,
          games,
          startDate: new Date(),
        });

      jest
        .spyOn(simulationService, 'getCurrentSimulation')
        .mockImplementation(() => {
          return Promise.resolve({
            name: simulationName,
            state: SimulationStates.Running,
            games,
            startDate: new Date(),
          });
        });

      await request(app.getHttpServer())
        .post('/')
        .send({ name: simulationName })
        .expect(201);

      for (let i = 1; i <= 9; i++) {
        jest.advanceTimersByTime(1000);
        games[0].homeGoals += 1; // Simplification: always add to home team

        const response = await request(app.getHttpServer())
          .get('/')
          .expect(200);

        expect(
          response.body.simulation.games[0].homeGoals +
            response.body.simulation.games[0].awayGoals,
        ).toBe(i);
      }

      jest.useRealTimers();
    });
  });
});
