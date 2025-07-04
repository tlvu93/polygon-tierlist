"use client";

import { useState, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { PolyList } from "./types";
import { PolygonChart } from "./PolygonChart";

interface MainContentProps {
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onPolyListDelete?: (id: string) => void;
  onPolyListNameChange?: (id: string, name: string) => void;
  onStatChange?: (statIndex: number, newValue: number) => void;
  isDraggable?: boolean;
  showPolyListList?: boolean;
  sortedPolyLists?: PolyList[];
  onAddPolyList?: () => void;
}

export default function MainContent({
  polyLists,
  currentPolyListId,
  onPolyListSelect,
  onPolyListDelete,
  onPolyListNameChange,
  onStatChange,
  isDraggable = false,
}: MainContentProps) {
  const [view, setView] = useState<"polyList" | "table">("polyList");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localName, setLocalName] = useState("");

  const currentPolyListIndex = polyLists.findIndex(
    (d) => d.id === currentPolyListId
  );
  const currentPolyList = polyLists[currentPolyListIndex];

  const debouncedNameChange = useDebounce((id: string, name: string) => {
    startTransition(() => {
      onPolyListNameChange?.(id, name);
    });
  }, 700);

  const handlePrevPolyList = () => {
    if (currentPolyListIndex > 0) {
      onPolyListSelect(polyLists[currentPolyListIndex - 1].id);
    }
  };

  const handleNextPolyList = () => {
    if (currentPolyListIndex < polyLists.length - 1) {
      onPolyListSelect(polyLists[currentPolyListIndex + 1].id);
    }
  };

  // Convert stats to stats format for PolygonChart
  const statsToStats = (polyList: PolyList) => {
    const statsObject: { [key: string]: number } = {};
    polyList.stats.forEach((stat) => {
      statsObject[stat.name.toLowerCase().replace(/\s+/g, "_")] = stat.value;
    });
    return statsObject;
  };

  const handleStatChange = (statIndex: number, newValue: number) => {
    if (onStatChange) {
      onStatChange(statIndex, newValue);
    }
  };

  return (
    <main className="flex-1 p-2 sm:p-6 overflow-auto main-content">
      <Card className="p-2 sm:p-6">
        {/* Poly List content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="group relative"
              onClick={(e) => {
                if (!isEditingName) {
                  e.preventDefault();
                  setIsEditingName(true);
                  setLocalName(currentPolyList?.name || "");
                }
              }}
            >
              {isEditingName ? (
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setLocalName(newValue);
                    debouncedNameChange(currentPolyListId, newValue);
                  }}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingName(false);
                    }
                  }}
                  className={`text-2xl font-semibold bg-transparent border-b border-slate-300 outline-none w-full ${
                    isPending ? "text-slate-400" : ""
                  }`}
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-semibold cursor-pointer group-hover:text-blue-600">
                  {currentPolyList?.name || "Untitled Poly List"}
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPolyListDelete?.(currentPolyListId)}
              className="h-10 w-10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setView(view === "polyList" ? "table" : "polyList")}
          >
            {view === "polyList" ? "Switch to Table" : "Switch to Poly List"}
          </Button>
        </div>

        {view === "polyList" ? (
          <div
            className="relative bg-slate-100 rounded-lg flex items-center justify-center p-2 sm:p-8 h-[calc(100vh-11rem)] sm:h-[calc(100vh-12rem)]"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {currentPolyList ? (
                <PolygonChart
                  stats={statsToStats(currentPolyList)}
                  onStatChange={handleStatChange}
                  isDraggable={isDraggable}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-slate-400">
                  No poly list selected
                </span>
              )}
            </div>
            <Button
              variant="outline"
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 rounded-full p-1 sm:p-2"
              onClick={handlePrevPolyList}
              disabled={currentPolyListIndex <= 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 rounded-full p-1 sm:p-2"
              onClick={handleNextPolyList}
              disabled={currentPolyListIndex >= polyLists.length - 1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {currentPolyList?.stats.map((stat, index) => (
                  <TableHead key={index}>{stat.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {polyLists.map((polyList) => (
                <TableRow key={polyList.id}>
                  <TableCell>{polyList.name}</TableCell>
                  {polyList.stats.map((stat, index) => (
                    <TableCell key={index}>{stat.value}</TableCell>
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
