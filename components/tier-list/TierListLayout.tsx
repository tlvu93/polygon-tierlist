"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import { useTierListData } from "./hooks/useTierListData";
import { DesktopLayout, MobileLayout } from "./components/layout";
import { TierListLayoutProps } from "./types/layout.types";

export default function TierListLayout({
  tierListName: initialTierListName = "Headphone Comparison",
  id,
}: TierListLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    tierListName,
    currentPolyListId,
    polyLists,
    sortedPolyLists,
    setCurrentPolyListId,
    handleStatCountChange,
    handleAddPolyList,
    handlePolyListDelete,
    handlePolyListNameChange,
    handleTierListNameChange,
  } = useTierListData({ id, initialTierListName });

  // Prepare props for layout components
  const mainContentProps = {
    polyLists,
    currentPolyListId,
    onPolyListSelect: setCurrentPolyListId,
    onPolyListDelete: handlePolyListDelete,
    onPolyListNameChange: handlePolyListNameChange,
    showPolyListList: true,
    sortedPolyLists,
    onAddPolyList: handleAddPolyList,
  };

  const polyListListProps = {
    polyLists: sortedPolyLists,
    currentPolyListId,
    onPolyListSelect: setCurrentPolyListId,
    onAddPolyList: handleAddPolyList,
  };

  const sidebarProps = {
    onStatCountChange: handleStatCountChange,
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        tierListName={tierListName}
        onTierListNameChange={handleTierListNameChange}
      />
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
        <DesktopLayout
          mainContentProps={mainContentProps}
          leftSidebarProps={{
            width: 200,
            collapsed: false,
            onToggleCollapse: () => {},
            onWidthChange: () => {},
          }}
          rightSidebarProps={{
            width: 200,
            collapsed: false,
            onToggleCollapse: () => {},
            onWidthChange: () => {},
          }}
          polyListListProps={polyListListProps}
          sidebarProps={sidebarProps}
        />

        <MobileLayout
          mainContentProps={mainContentProps}
          sidebarContent={<div>Sidebar Content</div>}
          isSheetOpen={isOpen}
          onSheetOpenChange={setIsOpen}
        />
      </div>
    </div>
  );
}
