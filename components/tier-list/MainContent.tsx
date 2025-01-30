"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Diagram } from "./types";
import { PolygonChart } from "./PolygonChart";

interface MainContentProps {
  diagrams: Diagram[];
  currentDiagramId: string;
  onDiagramSelect: (id: string) => void;
  onDiagramDelete?: (id: string) => void;
  onDiagramNameChange?: (id: string, name: string) => void;
}

export default function MainContent({
  diagrams,
  currentDiagramId,
  onDiagramSelect,
  onDiagramDelete,
  onDiagramNameChange,
}: MainContentProps) {
  const [view, setView] = useState<"diagram" | "table">("diagram");
  const [isEditingName, setIsEditingName] = useState(false);

  const currentDiagramIndex = diagrams.findIndex((d) => d.id === currentDiagramId);
  const currentDiagram = diagrams[currentDiagramIndex];

  const handlePrevDiagram = () => {
    if (currentDiagramIndex > 0) {
      onDiagramSelect(diagrams[currentDiagramIndex - 1].id);
    }
  };

  const handleNextDiagram = () => {
    if (currentDiagramIndex < diagrams.length - 1) {
      onDiagramSelect(diagrams[currentDiagramIndex + 1].id);
    }
  };

  // Convert properties to stats format for PolygonChart
  const propertiesToStats = (diagram: Diagram) => {
    const statsObject: { [key: string]: number } = {};
    diagram.properties.forEach((prop) => {
      statsObject[prop.name.toLowerCase().replace(/\s+/g, "_")] = prop.value;
    });
    return statsObject;
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="group relative"
              onClick={(e) => {
                if (!isEditingName) {
                  e.preventDefault();
                  setIsEditingName(true);
                }
              }}
            >
              {isEditingName ? (
                <input
                  type="text"
                  value={currentDiagram?.name || ""}
                  onChange={(e) => onDiagramNameChange?.(currentDiagramId, e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingName(false);
                    }
                  }}
                  className="text-2xl font-semibold bg-transparent border-b border-slate-300 outline-none w-full"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-semibold cursor-pointer group-hover:text-blue-600">
                  {currentDiagram?.name || "Untitled Diagram"}
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDiagramDelete?.(currentDiagramId)}
              className="h-10 w-10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setView(view === "diagram" ? "table" : "diagram")}>
            {view === "diagram" ? "Switch to Table" : "Switch to Diagram"}
          </Button>
        </div>

        {view === "diagram" ? (
          <div className="relative bg-slate-100 rounded-lg flex items-center justify-center p-4">
            <div className="relative aspect-square w-full max-w-4xl mx-auto">
              {currentDiagram ? (
                <PolygonChart stats={propertiesToStats(currentDiagram)} />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-slate-400">
                  No diagram selected
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2"
              onClick={handlePrevDiagram}
              disabled={currentDiagramIndex <= 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2"
              onClick={handleNextDiagram}
              disabled={currentDiagramIndex >= diagrams.length - 1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {currentDiagram?.properties.map((prop, index) => (
                  <TableHead key={index}>{prop.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagrams.map((diagram) => (
                <TableRow key={diagram.id}>
                  <TableCell>{diagram.name}</TableCell>
                  {diagram.properties.map((prop, index) => (
                    <TableCell key={index}>{prop.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  );
}
