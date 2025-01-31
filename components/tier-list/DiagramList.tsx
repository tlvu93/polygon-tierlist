"use client";

import { Diagram } from "./types";
import { PolygonChart } from "./PolygonChart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DiagramListProps {
  diagrams: Diagram[];
  currentDiagramId: string;
  onDiagramSelect: (id: string) => void;
  onAddDiagram: () => void;
}

export default function DiagramList({ diagrams, currentDiagramId, onDiagramSelect, onAddDiagram }: DiagramListProps) {
  // Convert properties to stats format for PolygonChart preview
  const propertiesToStats = (diagram: Diagram) => {
    const statsObject: { [key: string]: number } = {};
    diagram.properties.forEach((prop) => {
      statsObject[prop.name.toLowerCase().replace(/\s+/g, "_")] = prop.value;
    });
    return statsObject;
  };

  return (
    <div className="w-[18%] min-w-[280px] border-r bg-slate-100 overflow-auto">
      <div className="h-full flex flex-col p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Diagrams</h3>
          <Button variant="default" size="sm" className="h-7 text-xs px-2" onClick={onAddDiagram}>
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {diagrams.map((diagram) => (
            <div
              key={diagram.id}
              onClick={() => onDiagramSelect(diagram.id)}
              className={`
                p-3 rounded cursor-pointer transition-colors
                ${diagram.id === currentDiagramId ? "bg-white" : "hover:bg-slate-50"}
              `}
            >
              <div className="flex items-center gap-2">
                <div className="w-16 aspect-square">
                  <PolygonChart stats={propertiesToStats(diagram)} hideLabels isPreview />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{diagram.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
