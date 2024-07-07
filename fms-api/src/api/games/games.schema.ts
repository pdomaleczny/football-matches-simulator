import { Prop } from '@nestjs/mongoose';

export class Game {
  @Prop()
  homeTeam: string;

  @Prop()
  homeGoals: number;

  @Prop()
  awayTeam: string;

  @Prop()
  awayGoals: number;
}
