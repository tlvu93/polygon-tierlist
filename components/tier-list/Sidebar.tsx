"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolyList, Stat } from "./types";
import PolyListList from "./components/polylist/PolyListList";
import { useSidebarState } from "./components/sidebar/hooks";
import { EditorTab, SortingTab, SharingTab } from "./components/sidebar/tabs";

interface SortingConfig {
  stat: number;
  weight: number;
}

interface SidebarProps {
  statCount: number;
  onStatCountChange: (count: number) => void;
  currentPolyList?: PolyList;
  statNames: string[];
  selectedStatIndex?: number | null;
  onStatChange: (index: number, change: Partial<Stat>) => void;
  onSortingChange: (sortingConfigs: SortingConfig[]) => void;
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onAddPolyList: () => void;
  isDraggable?: boolean;
  onDraggableToggle?: (enabled: boolean) => void;
}

export default function Sidebar({
  statCount,
  onStatCountChange,
  currentPolyList,
  statNames,
  selectedStatIndex,
  onStatChange,
  onSortingChange,
  polyLists,
  currentPolyListId,
  onPolyListSelect,
  onAddPolyList,
  isDraggable = false,
  onDraggableToggle,
}: SidebarProps) {
  const [currentTab, setCurrentTab] = useState("editor");

  // Auto-switch to editor tab when a stat is selected
  useEffect(() => {
    if (selectedStatIndex !== null && selectedStatIndex !== undefined) {
      setCurrentTab("editor");
    }
  }, [selectedStatIndex]);

  const {
    localStatNames,
    localStatValues,
    sortingConfigs,
    isPending,
    debouncedStatNameChange,
    debouncedStatValueChange,
    debouncedSortingChange,
    handleStatCountChange,
  } = useSidebarState({
    statCount,
    currentPolyList,
    onStatChange,
    onSortingChange,
    onStatCountChange,
  });

  return (
    <aside className="w-full bg-slate-100 border-l overflow-y-auto">
      <div className="pt-12 lg:pt-2"></div>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
          <TabsTrigger value="polyLists" className="block lg:hidden">
            Poly Lists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <EditorTab
            statCount={statCount}
            localStatNames={localStatNames}
            localStatValues={localStatValues}
            isPending={isPending}
            selectedStatIndex={selectedStatIndex}
            isDraggable={isDraggable}
            onDraggableToggle={onDraggableToggle}
            onStatCountChange={handleStatCountChange}
            onStatNameChange={debouncedStatNameChange}
            onStatValueChange={debouncedStatValueChange}
          />
        </TabsContent>

        <TabsContent value="sorting">
          <SortingTab
            statCount={statCount}
            currentPolyList={currentPolyList}
            statNames={statNames}
            sortingConfigs={sortingConfigs}
            isPending={isPending}
            onSortingChange={debouncedSortingChange}
          />
        </TabsContent>

        <TabsContent value="sharing">
          <SharingTab currentPolyList={currentPolyList} polyLists={polyLists} />
        </TabsContent>

        <TabsContent value="polyLists" className="block lg:hidden">
          <PolyListList
            polyLists={polyLists}
            currentPolyListId={currentPolyListId}
            onPolyListSelect={onPolyListSelect}
            onAddPolyList={onAddPolyList}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
