"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PolyListList from "./components/polylist/PolyListList";
import { useSidebarState } from "./components/sidebar/hooks";
import { EditorTab, SortingTab, SharingTab } from "./components/sidebar/tabs";
import {
  useCurrentPolyList,
  useStatNames,
  useSelectedStatIndex,
  useSortedPolyLists,
  useIsDraggable,
  useTierListDataStore,
  createPolyList,
} from "@/stores";

// Only keep props that are truly needed for special cases
interface SidebarProps {
  onDraggableToggle?: (enabled: boolean) => void;
  onStatCountChange?: (count: number) => void;
}

export default function Sidebar({
  onDraggableToggle,
  onStatCountChange,
}: SidebarProps) {
  const [currentTab, setCurrentTab] = useState("editor");

  // Get data from stores
  const statCount = useTierListDataStore((state) => state.statCount);
  const currentPolyList = useCurrentPolyList();
  const statNames = useStatNames();
  const selectedStatIndex = useSelectedStatIndex();
  const polyLists = useSortedPolyLists();
  const currentPolyListId = useTierListDataStore(
    (state) => state.currentPolyListId
  );
  const isDraggable = useIsDraggable();

  // Get store actions
  const updateStat = useTierListDataStore((state) => state.updateStat);
  const setSortingConfigs = useTierListDataStore(
    (state) => state.setSortingConfigs
  );
  const setCurrentPolyListId = useTierListDataStore(
    (state) => state.setCurrentPolyListId
  );
  const addPolyList = useTierListDataStore((state) => state.addPolyList);
  const setStatCount = useTierListDataStore((state) => state.setStatCount);

  // Auto-switch to editor tab when a stat is selected
  useEffect(() => {
    if (selectedStatIndex !== null && selectedStatIndex !== undefined) {
      setCurrentTab("editor");
    }
  }, [selectedStatIndex]);

  // Handle adding new poly list
  const handleAddPolyList = () => {
    const newPolyList = createPolyList(
      `Poly List ${polyLists.length + 1}`,
      statCount
    );
    addPolyList(newPolyList);
    setCurrentPolyListId(newPolyList.id);
  };

  // Handle stat change using store
  const handleStatChange = (
    index: number,
    change: { name?: string; value?: number }
  ) => {
    if (currentPolyList) {
      updateStat(currentPolyList.id, index, change);
    }
  };

  // Handle stat count change - use prop if provided, otherwise use store
  const handleStatCountChange = (count: number) => {
    if (onStatCountChange) {
      onStatCountChange(count);
    } else {
      setStatCount(count);
    }
  };

  const {
    localStatNames,
    localStatValues,
    sortingConfigs,
    isPending,
    debouncedStatNameChange,
    debouncedStatValueChange,
    debouncedSortingChange,
    handleStatCountChange: hookStatCountChange,
  } = useSidebarState({
    statCount,
    currentPolyList,
    onStatChange: handleStatChange,
    onSortingChange: setSortingConfigs,
    onStatCountChange: handleStatCountChange,
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
            onStatCountChange={hookStatCountChange}
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
            onPolyListSelect={setCurrentPolyListId}
            onAddPolyList={handleAddPolyList}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
