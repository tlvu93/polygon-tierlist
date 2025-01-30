"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import DiagramList from "./DiagramList";

import { Diagram } from "./types";

interface TierListLayoutProps {
  tierListName?: string;
}

export default function TierListLayout({ tierListName = "Headphone Comparison" }: TierListLayoutProps) {
  const [propertyCount, setPropertyCount] = useState(3);
  const [currentDiagramId, setCurrentDiagramId] = useState<string>("1");

  // Mock data - replace with real data from your backend
  const diagrams = useMemo<Diagram[]>(
    () => [
      { id: "1", name: "Main Diagram" },
      { id: "2", name: "Alternative View" },
      { id: "3", name: "Simplified" },
    ],
    []
  );
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header tierListName={tierListName} isLoggedIn={true} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%]">
          <MainContent propertyCount={propertyCount} />
        </div>
        <DiagramList diagrams={diagrams} currentDiagramId={currentDiagramId} onDiagramSelect={setCurrentDiagramId} />
        <Sidebar propertyCount={propertyCount} onPropertyCountChange={setPropertyCount} />
      </div>
    </div>
  );
}
