"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PolygonChart } from "../chart/PolygonChart";

interface PolyListViewProps {
  currentPolyList: any;
  currentPolyListIndex: number;
  totalPolyLists: number;
  onPrevPolyList: () => void;
  onNextPolyList: () => void;
}

export function PolyListView({
  currentPolyList,
  currentPolyListIndex,
  totalPolyLists,
  onPrevPolyList,
  onNextPolyList,
}: PolyListViewProps) {
  return (
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
          <PolygonChart />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-slate-400">
            No poly list selected
          </span>
        )}
      </div>

      <Button
        variant="outline"
        className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 rounded-full p-1 sm:p-2"
        onClick={onPrevPolyList}
        disabled={currentPolyListIndex <= 0}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 rounded-full p-1 sm:p-2"
        onClick={onNextPolyList}
        disabled={currentPolyListIndex >= totalPolyLists - 1}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>
    </div>
  );
}
