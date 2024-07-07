import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Game } from '../games/games.schema';

export enum SimulationStates {
  Ready = 'ready',
  Running = 'running',
  Finished = 'finished',
}

export type SimulationDocument = HydratedDocument<Simulation>;

@Schema({ collection: 'simulations', timestamps: true })
export class Simulation {
  @Prop()
  name: string;

  @Prop()
  games: Game[];

  @Prop()
  state: SimulationStates;

  @Prop()
  startDate: Date;
}

export const SimulationSchema = SchemaFactory.createForClass(Simulation);
