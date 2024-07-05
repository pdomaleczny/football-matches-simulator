"use client";
import { useEffect, useState } from "react";
import { CreateNewSimulation } from "../components/CreateNewSimulation";
import {
  sendToApiCreateNewGameSimulation,
  sendToApiGetCurrentGameSimulation,
} from "@/lib/api";

type Simulation = {
  name: string;
};

type CreateSimulationData = {
  simulationName: string;
};

export default function Home() {
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(
    null,
  );

  useEffect(() => {
    const fetchCurrentGame = async () => {
      const { simulation } = await sendToApiGetCurrentGameSimulation();
      if (simulation) {
        setCurrentSimulation({ name: simulation.name });
      }
    };

    fetchCurrentGame();
  }, []);

  const handleCreateSimulation = async (data: CreateSimulationData) => {
    const { simulation } = await sendToApiCreateNewGameSimulation(
      data.simulationName,
    );
    setCurrentSimulation({ name: simulation.name });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">⚽ Football matches simulator ⚽</h1>
      <div className="flex flex-col mx-auto max-w-[1024px] pt-20">
        {currentSimulation ? (
          currentSimulation.name
        ) : (
          <CreateNewSimulation onCreateNewSimulation={handleCreateSimulation} />
        )}
      </div>
    </main>
  );
}
