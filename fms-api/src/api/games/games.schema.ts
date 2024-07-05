import { Prop } from '@nestjs/mongoose';

export class Game {
  @Prop()
  homeCountryName: string;

  @Prop()
  homeCountryScore: number;

  @Prop()
  awayCountryName: string;

  @Prop()
  awayCountryScore: number;
}
