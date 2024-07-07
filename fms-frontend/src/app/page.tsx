"use client";
import { useEffect, useState } from "react";
import { CreateNewSimulation } from "../components/CreateNewSimulation";
import { Simulation } from "../components/Simulation";
import {
  sendToApiStartSimulation,
  sendToApiGetCurrentGameSimulation,
  sendToApiEndSimulation,
} from "@/lib/api";
import { Simulation as SimulationType } from "@/lib/types";

type CreateSimulationData = {
  simulationName: string;
};

export default function Home() {
  const [currentSimulation, setCurrentSimulation] =
    useState<SimulationType | null>(null);

  useEffect(() => {
    const fetchCurrentGame = async () => {
      const { simulation } = await sendToApiGetCurrentGameSimulation();
      if (simulation) {
        setCurrentSimulation(simulation);
      }
    };

    fetchCurrentGame();
  }, []);

  const handleStartSimulation = async (data: CreateSimulationData) => {
    const { simulation, error } = await sendToApiStartSimulation(
      data.simulationName,
    );

    if (error) {
      return;
    }

    setCurrentSimulation(simulation);
  };

  const handleFinishSimulation = async (data: CreateSimulationData) => {
    const { simulation } = await sendToApiEndSimulation(data.simulationName);
    setCurrentSimulation(simulation);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold">⚽ Football matches simulator ⚽</h1>
      <div className="flex flex-col mx-auto max-w-[1024px] pt-20">
        {currentSimulation ? (
          <Simulation
            simulation={currentSimulation}
            updateSimulationScore={(newSimulation) => {
              setCurrentSimulation(newSimulation);
            }}
            onFinishNewSimulation={() => {
              handleFinishSimulation({
                simulationName: currentSimulation.name,
              });
            }}
            onStartNewSimulation={() => {
              handleStartSimulation({ simulationName: currentSimulation.name });
            }}
          />
        ) : (
          <CreateNewSimulation onCreateNewSimulation={handleStartSimulation} />
        )}
      </div>
    </main>
  );
}
