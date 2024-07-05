import { Injectable } from '@nestjs/common';
import { Game } from './games.schema';

@Injectable()
export class GameService {
  getDefaultGames(): Game[] {
    return [
      {
        homeCountryName: 'Germany',
        homeCountryScore: 0,
        awayCountryName: 'Poland',
        awayCountryScore: 0,
      },
      {
        homeCountryName: 'Brazil',
        homeCountryScore: 0,
        awayCountryName: 'Mexico',
        awayCountryScore: 0,
      },
      {
        homeCountryName: 'Argentina',
        homeCountryScore: 0,
        awayCountryName: 'Uruguay',
        awayCountryScore: 0,
      },
    ];
  }

  scoreOneRandomGoal(games: Game[]) {
    const randomGameIndex = Math.floor(Math.random() * games.length);

    if (Math.random() > 0.5) {
      games[randomGameIndex].homeCountryScore += 1;
    } else {
      games[randomGameIndex].awayCountryScore += 1;
    }

    return games;
  }
}
