"use client";

import { useEffect, useRef } from "react";
import Header from "@/app/components/Header";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PolyListList from "./components/polylist/PolyListList";
import MainContent from "./components/content/MainContent";
import {
  useTierListDataStore,
  useTierListUIStore,
  useSortedPolyLists,
  useLeftSidebarState,
  useRightSidebarState,
  useIsSheetOpen,
  useHasHydrated,
  createPolyList,
} from "@/stores";

interface TierListLayoutProps {
  tierListName?: string;
  id?: string;
}

export default function TierListLayout({
  tierListName: initialTierListName = "Headphone Comparison",
  id,
}: TierListLayoutProps) {
  // Get data from stores
  const {
    tierListName,
    statCount,
    polyLists,
    currentPolyListId,
    setTierListName,
    addPolyList,
    updatePolyList,
    deletePolyList,
    setCurrentPolyListId,
  } = useTierListDataStore();

  const {
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebarWidth,
    setRightSidebarWidth,
    setIsDraggable,
    setIsSheetOpen,
  } = useTierListUIStore();

  // Get computed values from stores
  const sortedPolyLists = useSortedPolyLists();
  const leftSidebar = useLeftSidebarState();
  const rightSidebar = useRightSidebarState();
  const isSheetOpen = useIsSheetOpen();

  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const minSidebarWidth = 160;
  const maxSidebarWidth = 400;
  const hasHydrated = useHasHydrated();

  // Initialize data after hydration
  useEffect(() => {
    if (!hasHydrated || !id) return;

    // Set tier list name if not already set
    if (!tierListName || tierListName === "Headphone Comparison") {
      setTierListName(initialTierListName);
    }

    // Ensure we have at least one poly list
    if (polyLists.length === 0) {
      const defaultPolyList = createPolyList("Poly List 1", 5);
      addPolyList(defaultPolyList);
      setCurrentPolyListId(defaultPolyList.id);
    }
  }, [
    hasHydrated,
    id,
    initialTierListName,
    tierListName,
    polyLists.length,
    setTierListName,
    addPolyList,
    setCurrentPolyListId,
  ]);

  // Handler functions - now much simpler
  const handleAddPolyList = () => {
    const newPolyList = createPolyList(
      `Poly List ${polyLists.length + 1}`,
      statCount
    );
    addPolyList(newPolyList);
    setCurrentPolyListId(newPolyList.id);
  };

  const handlePolyListDelete = (polyListId: string) => {
    deletePolyList(polyListId);
  };

  const handleStatCountChange = (newCount: number) => {
    // Use the existing store logic for updating stat count
    useTierListDataStore.getState().setStatCount(newCount);
  };

  // Drag logic for sidebars
  const handleLeftDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebar.width;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(startWidth + (moveEvent.clientX - startX), minSidebarWidth),
        maxSidebarWidth
      );
      setLeftSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleRightDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightSidebar.width;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(startWidth - (moveEvent.clientX - startX), minSidebarWidth),
        maxSidebarWidth
      );
      setRightSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Show loading state while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tier list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tierListName={tierListName}
        onTierListNameChange={setTierListName}
      />

      {/* Desktop Layout - Three Column */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div
          ref={leftSidebarRef}
          style={{
            width: leftSidebar.collapsed ? 24 : leftSidebar.width,
            minWidth: leftSidebar.collapsed ? 24 : minSidebarWidth,
            maxWidth: leftSidebar.collapsed ? 24 : maxSidebarWidth,
            transition: "width 0.2s cubic-bezier(.4,1.2,.6,1)",
            position: "relative",
            zIndex: 10,
          }}
          className="border-r bg-white flex flex-col h-full relative"
        >
          {!leftSidebar.collapsed && (
            <PolyListList
              polyLists={sortedPolyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={setCurrentPolyListId}
              onAddPolyList={handleAddPolyList}
            />
          )}
          <button
            className="absolute top-1/2 right-0 -translate-y-1/2 z-20 bg-white border border-slate-200 rounded-full shadow p-1 hover:bg-slate-100 focus:outline-none"
            style={{
              transform: "translateY(-50%) translateX(50%)",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={toggleLeftSidebar}
            aria-label={
              leftSidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {leftSidebar.collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
          {!leftSidebar.collapsed && (
            <div
              onMouseDown={handleLeftDrag}
              className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-30"
              style={{ background: "transparent" }}
            />
          )}
        </div>

        {/* Center Column - Main Content */}
        <div className="flex-1">
          <MainContent
            polyLists={polyLists}
            currentPolyListId={currentPolyListId}
            onPolyListSelect={setCurrentPolyListId}
            onPolyListDelete={handlePolyListDelete}
            onPolyListNameChange={(id, name) => updatePolyList(id, { name })}
          />
        </div>

        {/* Right Sidebar */}
        <div
          ref={rightSidebarRef}
          style={{
            width: rightSidebar.collapsed ? 24 : rightSidebar.width,
            minWidth: rightSidebar.collapsed ? 24 : minSidebarWidth,
            maxWidth: rightSidebar.collapsed ? 24 : maxSidebarWidth,
            transition: "width 0.2s cubic-bezier(.4,1.2,.6,1)",
            position: "relative",
            zIndex: 10,
          }}
          className="border-l bg-white flex flex-col h-full relative"
        >
          {!rightSidebar.collapsed && (
            <Sidebar
              onStatCountChange={handleStatCountChange}
              onDraggableToggle={setIsDraggable}
            />
          )}
          <button
            className="absolute top-1/2 left-0 -translate-y-1/2 z-20 bg-white border border-slate-200 rounded-full shadow p-1 hover:bg-slate-100 focus:outline-none"
            style={{
              transform: "translateY(-50%) translateX(-50%)",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={toggleRightSidebar}
            aria-label={
              rightSidebar.collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {rightSidebar.collapsed ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {!rightSidebar.collapsed && (
            <div
              onMouseDown={handleRightDrag}
              className="absolute top-0 left-0 h-full w-2 cursor-ew-resize z-30"
              style={{ background: "transparent" }}
            />
          )}
        </div>
      </div>

      {/* Mobile Layout - Single Column with Sheet */}
      <div className="lg:hidden flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col">
          <MainContent
            polyLists={polyLists}
            currentPolyListId={currentPolyListId}
            onPolyListSelect={setCurrentPolyListId}
            onPolyListDelete={handlePolyListDelete}
            onPolyListNameChange={(id, name) => updatePolyList(id, { name })}
          />
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-20 right-4 z-50"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <Sidebar
              onStatCountChange={handleStatCountChange}
              onDraggableToggle={setIsDraggable}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
