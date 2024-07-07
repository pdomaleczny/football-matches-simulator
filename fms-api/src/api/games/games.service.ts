import { Injectable } from '@nestjs/common';
import { Game } from './games.schema';

@Injectable()
export class GameService {
  getDefaultGames(): Game[] {
    return [
      {
        homeTeam: 'Germany',
        homeGoals: 0,
        awayTeam: 'Poland',
        awayGoals: 0,
      },
      {
        homeTeam: 'Brazil',
        homeGoals: 0,
        awayTeam: 'Mexico',
        awayGoals: 0,
      },
      {
        homeTeam: 'Argentina',
        homeGoals: 0,
        awayTeam: 'Uruguay',
        awayGoals: 0,
      },
    ];
  }

  scoreOneRandomGoal(games: Game[]) {
    const randomGameIndex = Math.floor(Math.random() * games.length);

    const newGames = games.map((game, index) => {
      if (index === randomGameIndex) {
        if (Math.random() > 0.5) {
          return { ...game, homeGoals: game.homeGoals + 1 };
        } else {
          return { ...game, awayGoals: game.awayGoals + 1 };
        }
      } else {
        return game;
      }
    });

    return newGames;
  }
}
