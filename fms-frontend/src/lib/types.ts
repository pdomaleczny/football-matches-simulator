export enum SimulationStates {
  Ready = "ready",
  Running = "running",
  Finished = "finished",
}

export type Game = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
};

export type Simulation = {
  name: string;
  games: Game[];
  state: SimulationStates;
  startDate: Date;
};
