import { Injectable } from '@nestjs/common';
import { LiveUpdateGateway } from './liveupdate.gateway';
import { SimulationPayload } from '../simulations/simulations.payload';

@Injectable()
export class LiveUpdateService {
  constructor(private liveUpdateGateway: LiveUpdateGateway) {}

  sendSimulationUpdateToAllClients(simulation: SimulationPayload) {
    this.liveUpdateGateway.sendToAll('updateSimulation', {
      simulation: simulation,
    });
  }
}
