import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { LiveUpdateGateway } from '../liveupdates.gateway';

describe('LiveUpdateGateway', () => {
  let gateway: LiveUpdateGateway;
  let mockServer: Partial<Server>;
  let mockClient: Partial<Socket>;
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      sockets: {
        sockets: {
          size: 2,
        },
      } as any,
    };

    mockClient = {
      id: 'testClientId',
    };

    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveUpdateGateway,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    gateway = module.get<LiveUpdateGateway>(LiveUpdateGateway);
    (gateway as any).io = mockServer as Server;
    (gateway as any).logger = mockLogger;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should log initialization', () => {
      gateway.afterInit();
      expect(gateway['logger'].log).toHaveBeenCalledWith('Initialized');
    });
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      gateway.handleConnection(mockClient);
      expect(gateway['logger'].log).toHaveBeenCalledWith(
        'Client id: testClientId connected',
      );
    });

    it('should log number of connected clients', () => {
      gateway.handleConnection(mockClient);
      expect(gateway['logger'].debug).toHaveBeenCalledWith(
        'Number of connected clients: 2',
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      gateway.handleDisconnect(mockClient);
      expect(gateway['logger'].log).toHaveBeenCalledWith(
        'Cliend id:testClientId disconnected',
      );
    });
  });

  describe('sendToAll', () => {
    it('should emit event to all clients', () => {
      const event = 'testEvent';
      const data = { message: 'Hello, World!' };
      gateway.sendToAll(event, data);
      expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('sendToClient', () => {
    it('should emit event to specific client', () => {
      const clientId = 'testClientId';
      const event = 'testEvent';
      const data = { message: 'Hello, Client!' };
      gateway.sendToClient(clientId, event, data);
      expect(mockServer.to).toHaveBeenCalledWith(clientId);
      expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });
  });
});
