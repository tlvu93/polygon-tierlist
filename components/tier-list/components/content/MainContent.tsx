"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PolyList } from "../../types";
import { PolyListHeader } from "./PolyListHeader";
import { PolyListView } from "./PolyListView";
import { TableView } from "./TableView";

interface MainContentProps {
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onPolyListDelete?: (id: string) => void;
  onPolyListNameChange?: (id: string, name: string) => void;
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
}: MainContentProps) {
  const [view, setView] = useState<"polyList" | "table">("polyList");

  const currentPolyListIndex = polyLists.findIndex(
    (d) => d.id === currentPolyListId
  );
  const currentPolyList = polyLists[currentPolyListIndex];

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

  return (
    <main className="flex-1 p-2 sm:p-6 overflow-auto main-content">
      <Card className="p-2 sm:p-6">
        <PolyListHeader
          currentPolyListName={currentPolyList?.name || ""}
          currentPolyListId={currentPolyListId}
          view={view}
          onViewChange={setView}
          onPolyListDelete={onPolyListDelete}
          onPolyListNameChange={onPolyListNameChange}
        />

        {view === "polyList" ? (
          <PolyListView
            currentPolyList={currentPolyList}
            currentPolyListIndex={currentPolyListIndex}
            totalPolyLists={polyLists.length}
            onPrevPolyList={handlePrevPolyList}
            onNextPolyList={handleNextPolyList}
          />
        ) : (
          <TableView polyLists={polyLists} currentPolyList={currentPolyList} />
        )}
      </Card>
    </main>
  );
}
