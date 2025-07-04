"use client";

import { PolyList } from "./types";
import { PolygonChart } from "./PolygonChart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PolyListListProps {
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onAddPolyList: () => void;
}

export default function PolyListList({
  polyLists,
  currentPolyListId,
  onPolyListSelect,
  onAddPolyList,
}: PolyListListProps) {
  // Convert stats to stats format for PolygonChart preview
  const statsToStats = (polyList: PolyList) => {
    const statsObject: { [key: string]: number } = {};
    polyList.stats.forEach((stat) => {
      statsObject[stat.name.toLowerCase().replace(/\s+/g, "_")] = stat.value;
    });
    return statsObject;
  };

  return (
    <div className="h-full w-full border-r bg-slate-100 overflow-auto">
      <div className="h-full flex flex-col p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Poly Lists</h3>
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={onAddPolyList}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {polyLists.map((polyList) => (
            <div
              key={polyList.id}
              onClick={() => onPolyListSelect(polyList.id)}
              className={`
                p-3 rounded cursor-pointer transition-colors
                ${
                  polyList.id === currentPolyListId
                    ? "bg-white"
                    : "hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <div className="w-16 aspect-square">
                  <PolygonChart
                    stats={statsToStats(polyList)}
                    hideLabels
                    isPreview
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{polyList.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
