import { useEffect, useState } from "react";
import { SimulationStates, Simulation as SimulationType } from "../lib/types";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { io } from "socket.io-client";

type SimulationProps = {
  simulation: SimulationType;
  onStartNewSimulation: () => void;
  onFinishNewSimulation: () => void;
  updateSimulationScore: (simulation: SimulationType) => void;
};

export const Simulation = ({
  simulation,
  onStartNewSimulation,
  onFinishNewSimulation,
  updateSimulationScore,
}: SimulationProps) => {
  const [blockedRestart, setBlockedRestart] = useState(false);
  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      path: "/socket.io/",
    });

    socket.on("updateSimulation", ({ simulation }) => {
      updateSimulationScore(simulation);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const totalGoals = simulation.games.reduce(
    (acc, game) => acc + game.homeGoals + game.awayGoals,
    0,
  );

  const blockRestarting = () => {
    setBlockedRestart(true);

    setTimeout(() => {
      setBlockedRestart(false);
    }, 5000);
  };

  const finishSimulation = () => {
    onFinishNewSimulation();
  };

  const startSimulation = () => {
    onStartNewSimulation();
    blockRestarting();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{simulation.name}</CardTitle>
        {simulation.state === SimulationStates.Running && (
          <Button onClick={finishSimulation}>Stop</Button>
        )}
        {simulation.state === SimulationStates.Finished && (
          <Button disabled={blockedRestart} onClick={startSimulation}>
            Restart
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div>
          <ul>
            {simulation.games.map((game) => (
              <li className="mt-4" key={`${game.homeTeam}vs${game.awayTeam}`}>
                <h3 className="text-lg text-center">
                  <span className="font-bold">{game.homeTeam}</span> vs{" "}
                  <span className="font-bold">{game.awayTeam}</span>
                </h3>
                <div className="text text-center">
                  {game.homeGoals} - {game.awayGoals}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <CardFooter className="pt-10">
          <div className="flex gap-4 justify-between">
            <div>
              <span className="font-bold">Goals:</span> {totalGoals}
            </div>
            <div>
              <span className="font-bold">State:</span> {simulation.state}
            </div>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};
