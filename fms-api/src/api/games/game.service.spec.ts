import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './games.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  describe('getDefaultGames', () => {
    it('should return an array of 3 default games', () => {
      const games = service.getDefaultGames();
      expect(games).toHaveLength(3);
      expect(games[0]).toEqual({
        homeTeam: 'Germany',
        homeGoals: 0,
        awayTeam: 'Poland',
        awayGoals: 0,
      });
      expect(games[1]).toEqual({
        homeTeam: 'Brazil',
        homeGoals: 0,
        awayTeam: 'Mexico',
        awayGoals: 0,
      });
      expect(games[2]).toEqual({
        homeTeam: 'Argentina',
        homeGoals: 0,
        awayTeam: 'Uruguay',
        awayGoals: 0,
      });
    });
  });

  describe('scoreOneRandomGoal', () => {
    it('should add one goal to a random game', () => {
      const initialGames = service.getDefaultGames();
      const updatedGames = service.scoreOneRandomGoal(initialGames);

      // Check that exactly one goal was added
      const initialTotalGoals = initialGames.reduce(
        (sum, game) => sum + game.homeGoals + game.awayGoals,
        0,
      );
      const updatedTotalGoals = updatedGames.reduce(
        (sum, game) => sum + game.homeGoals + game.awayGoals,
        0,
      );
      expect(updatedTotalGoals).toBe(initialTotalGoals + 1);

      // Check that only one game was updated
      const changedGames = updatedGames.filter(
        (game, index) =>
          game.homeGoals !== initialGames[index].homeGoals ||
          game.awayGoals !== initialGames[index].awayGoals,
      );
      expect(changedGames).toHaveLength(1);

      // Check that the goal was added to either home or away team
      const changedGame = changedGames[0];
      const initialGame = initialGames.find(
        (game) =>
          game.homeTeam === changedGame.homeTeam &&
          game.awayTeam === changedGame.awayTeam,
      );
      expect(changedGame.homeGoals + changedGame.awayGoals).toBe(
        initialGame.homeGoals + initialGame.awayGoals + 1,
      );
    });

    it('should not modify the original games array', () => {
      const initialGames = service.getDefaultGames();
      const gamesCopy = JSON.parse(JSON.stringify(initialGames));
      service.scoreOneRandomGoal(initialGames);
      expect(initialGames).toEqual(gamesCopy);
    });
  });
});
