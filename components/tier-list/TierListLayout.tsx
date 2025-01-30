"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import DiagramList from "./DiagramList";

import { Diagram, DiagramStats } from "./types";

interface TierListLayoutProps {
  tierListName?: string;
}

export default function TierListLayout({ tierListName = "Headphone Comparison" }: TierListLayoutProps) {
  const [propertyCount, setPropertyCount] = useState(3);
  const [currentDiagramId, setCurrentDiagramId] = useState<string>("1");
  const [diagrams, setDiagrams] = useState<Diagram[]>(() => [
    {
      id: "1",
      name: "Main Diagram",
      stats: {
        fighting: 7,
        farming: 5,
        supporting: 8,
        pushing: 6,
        versatility: 7,
      },
    },
    {
      id: "2",
      name: "Alternative View",
      stats: {
        fighting: 4,
        farming: 8,
        supporting: 6,
        pushing: 7,
        versatility: 5,
      },
    },
    {
      id: "3",
      name: "Simplified",
      stats: {
        fighting: 6,
        farming: 6,
        supporting: 6,
        pushing: 6,
        versatility: 6,
      },
    },
  ]);

  const currentDiagram = useMemo(() => diagrams.find((d) => d.id === currentDiagramId), [diagrams, currentDiagramId]);

  const handleStatsChange = (newStats: DiagramStats) => {
    setDiagrams(
      diagrams.map((diagram) => (diagram.id === currentDiagramId ? { ...diagram, stats: newStats } : diagram))
    );
    // In a real app, you'd save this to your backend
    console.log("Updated stats:", newStats);
  };
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header tierListName={tierListName} isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%]">
          <MainContent propertyCount={propertyCount} currentStats={currentDiagram?.stats} />
        </div>
        <DiagramList diagrams={diagrams} currentDiagramId={currentDiagramId} onDiagramSelect={setCurrentDiagramId} />
        <Sidebar
          propertyCount={propertyCount}
          onPropertyCountChange={setPropertyCount}
          currentStats={currentDiagram?.stats}
          onStatsChange={handleStatsChange}
        />
      </div>
    </div>
  );
}
