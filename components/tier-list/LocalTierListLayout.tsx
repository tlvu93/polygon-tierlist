"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import PolyListList from "./PolyListList";
import { PolyList } from "./types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortingConfig {
  stat: number;
  weight: number;
}

interface TierListLayoutProps {
  tierListName?: string;
  id?: string;
}

export default function TierListLayout({
  tierListName: initialTierListName = "Headphone Comparison",
  id,
}: TierListLayoutProps) {
  const [tierListName, setTierListName] = useState(initialTierListName);
  const [statCount, setStatCount] = useState(5);
  const [currentPolyListId, setCurrentPolyListId] = useState("");
  const [polyLists, setPolyLists] = useState<PolyList[]>([]);
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256); // px
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256); // px
  const [isDraggable, setIsDraggable] = useState(false);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const minSidebarWidth = 160;
  const maxSidebarWidth = 400;

  // Load diagrams and stats from localStorage
  const loadPolyLists = useCallback(() => {
    if (!id) return;

    try {
      const tierListData = localStorage.getItem(`tierlist-${id}`);
      if (tierListData) {
        const data = JSON.parse(tierListData);
        setPolyLists(data.polyLists || []);
        setCurrentPolyListId(data.currentPolyListId || "");
        setTierListName(data.name || initialTierListName);
        setStatCount(data.statCount || 5);
        setSortingConfigs(data.sortingConfigs || []);
      } else {
        // Create a default diagram if none exist
        const defaultDiagram: PolyList = {
          id: `diagram-${Date.now()}`,
          name: "Poly List 1",
          thumbnail: "/placeholder.svg",
          stats: Array(statCount)
            .fill(null)
            .map((_, i) => ({
              name: `Stat ${i + 1}`,
              value: 5.0,
            })),
        };

        setPolyLists([defaultDiagram]);
        setCurrentPolyListId(defaultDiagram.id);

        // Save to localStorage
        saveToLocalStorage([defaultDiagram], defaultDiagram.id);
      }
    } catch (error) {
      console.error("Error loading diagrams:", error);
    }
  }, [id, statCount, initialTierListName]);

  // Save to localStorage
  const saveToLocalStorage = (
    polyLists: PolyList[],
    currentPolyListId: string
  ) => {
    if (!id) return;

    const tierListData = {
      name: tierListName,
      polyLists: polyLists,
      currentPolyListId: currentPolyListId,
      statCount: statCount,
      sortingConfigs: sortingConfigs,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(`tierlist-${id}`, JSON.stringify(tierListData));
  };

  useEffect(() => {
    loadPolyLists();
  }, [loadPolyLists]);

  // Auto-save when data changes
  useEffect(() => {
    if (polyLists.length > 0 && currentPolyListId) {
      saveToLocalStorage(polyLists, currentPolyListId);
    }
  }, [polyLists, currentPolyListId, tierListName, statCount, sortingConfigs]);

  const currentPolyList = useMemo(
    () => polyLists.find((d) => d.id === currentPolyListId),
    [polyLists, currentPolyListId]
  );

  const sortedPolyLists = useMemo(() => {
    if (sortingConfigs.length === 0) return polyLists;

    return [...polyLists].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const totalWeight = sortingConfigs.reduce(
        (sum, config) => sum + config.weight,
        0
      );

      // Normalize weights if total is not 1
      const normalizer = totalWeight === 0 ? 1 : totalWeight;

      sortingConfigs.forEach((config) => {
        const propA = a.stats[config.stat]?.value || 0;
        const propB = b.stats[config.stat]?.value || 0;
        const normalizedWeight = config.weight / normalizer;

        scoreA += propA * normalizedWeight;
        scoreB += propB * normalizedWeight;
      });

      return scoreB - scoreA; // Sort in descending order (highest score first)
    });
  }, [polyLists, sortingConfigs]);

  // Pre-compute stat names for the current diagram
  const statNames = useMemo(() => {
    return Array(statCount)
      .fill(null)
      .map((_, i) => currentPolyList?.stats[i]?.name || `Stat ${i + 1}`);
  }, [statCount, currentPolyList]);

  // Handle stat count changes
  const handleStatCountChange = useCallback(
    (newCount: number) => {
      if (!id) return;

      try {
        const updatedPolyLists = [...polyLists];

        for (let i = 0; i < updatedPolyLists.length; i++) {
          const polyList = updatedPolyLists[i];
          let newStats = [...polyList.stats];

          if (newStats.length < newCount) {
            // Add new stats with consistent names
            const additionalStats = Array(newCount - newStats.length)
              .fill(null)
              .map((_, i) => {
                const statIndex = newStats.length + i;
                // Look for existing stat name at this index across all diagrams
                const existingName = polyLists.find(
                  (d) => d.stats[statIndex]?.name
                )?.stats[statIndex].name;
                return {
                  name: existingName || `Stat ${statIndex + 1}`,
                  value: 5.0,
                };
              });

            newStats = [...newStats, ...additionalStats];
          } else if (newStats.length > newCount) {
            // Remove excess stats
            newStats = newStats.slice(0, newCount);
          }

          updatedPolyLists[i] = { ...polyList, stats: newStats };
        }

        setPolyLists(updatedPolyLists);
        setStatCount(newCount);
      } catch (error) {
        console.error("Error updating stat count:", error);
      }
    },
    [id, polyLists]
  );

  const handlePolyListSelect = useCallback((polyListId: string) => {
    setCurrentPolyListId(polyListId);
  }, []);

  const handlePolyListUpdate = useCallback(
    (polyListId: string, updates: Partial<PolyList>) => {
      setPolyLists((prev) =>
        prev.map((d) => (d.id === polyListId ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const handlePolyListDelete = useCallback(
    (polyListId: string) => {
      setPolyLists((prev) => prev.filter((d) => d.id !== polyListId));
      if (currentPolyListId === polyListId) {
        const remainingPolyLists = polyLists.filter((d) => d.id !== polyListId);
        setCurrentPolyListId(remainingPolyLists[0]?.id || "");
      }
    },
    [currentPolyListId, polyLists]
  );

  const handleAddPolyList = useCallback(() => {
    const newPolyList: PolyList = {
      id: `diagram-${Date.now()}`,
      name: `Poly List ${polyLists.length + 1}`,
      thumbnail: "/placeholder.svg",
      stats: Array(statCount)
        .fill(null)
        .map((_, i) => ({
          name: `Stat ${i + 1}`,
          value: 5.0,
        })),
    };

    setPolyLists((prev) => [...prev, newPolyList]);
    setCurrentPolyListId(newPolyList.id);
  }, [polyLists.length, statCount]);

  // Drag logic for left sidebar
  const handleLeftDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;
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

  // Drag logic for right sidebar
  const handleRightDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightSidebarWidth;
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
            width: leftSidebarCollapsed ? 24 : leftSidebarWidth,
            minWidth: leftSidebarCollapsed ? 24 : minSidebarWidth,
            maxWidth: leftSidebarCollapsed ? 24 : maxSidebarWidth,
            transition: "width 0.2s cubic-bezier(.4,1.2,.6,1)",
            position: "relative",
            zIndex: 10,
          }}
          className="border-r bg-white flex flex-col h-full relative"
        >
          {!leftSidebarCollapsed && (
            <PolyListList
              polyLists={sortedPolyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={handlePolyListSelect}
              onAddPolyList={handleAddPolyList}
            />
          )}
          {/* Collapse/Expand Button */}
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
            onClick={() => setLeftSidebarCollapsed((c) => !c)}
            aria-label={
              leftSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {leftSidebarCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
          {/* Draggable Handle */}
          {!leftSidebarCollapsed && (
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
            onPolyListSelect={handlePolyListSelect}
            onPolyListDelete={handlePolyListDelete}
            onPolyListNameChange={(id, name) =>
              handlePolyListUpdate(id, { name })
            }
            onStatChange={(statIndex, newValue) => {
              if (currentPolyList) {
                const updatedStats = [...currentPolyList.stats];
                updatedStats[statIndex] = {
                  ...updatedStats[statIndex],
                  value: newValue,
                };
                handlePolyListUpdate(currentPolyList.id, {
                  stats: updatedStats,
                });
              }
            }}
            isDraggable={isDraggable}
          />
        </div>

        {/* Right Sidebar */}
        <div
          ref={rightSidebarRef}
          style={{
            width: rightSidebarCollapsed ? 24 : rightSidebarWidth,
            minWidth: rightSidebarCollapsed ? 24 : minSidebarWidth,
            maxWidth: rightSidebarCollapsed ? 24 : maxSidebarWidth,
            transition: "width 0.2s cubic-bezier(.4,1.2,.6,1)",
            position: "relative",
            zIndex: 10,
          }}
          className="border-l bg-white flex flex-col h-full relative"
        >
          {!rightSidebarCollapsed && (
            <Sidebar
              statCount={statCount}
              onStatCountChange={handleStatCountChange}
              currentPolyList={currentPolyList}
              statNames={statNames}
              onStatChange={(index, change) => {
                if (currentPolyList) {
                  const updatedStats = [...currentPolyList.stats];
                  updatedStats[index] = {
                    ...updatedStats[index],
                    ...change,
                  };
                  handlePolyListUpdate(currentPolyList.id, {
                    stats: updatedStats,
                  });
                }
              }}
              onSortingChange={setSortingConfigs}
              polyLists={sortedPolyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={handlePolyListSelect}
              onAddPolyList={handleAddPolyList}
              isDraggable={isDraggable}
              onDraggableToggle={setIsDraggable}
            />
          )}
          {/* Collapse/Expand Button */}
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
            onClick={() => setRightSidebarCollapsed((c) => !c)}
            aria-label={
              rightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {rightSidebarCollapsed ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
          {/* Draggable Handle */}
          {!rightSidebarCollapsed && (
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
            onPolyListSelect={handlePolyListSelect}
            onPolyListDelete={handlePolyListDelete}
            onPolyListNameChange={(id, name) =>
              handlePolyListUpdate(id, { name })
            }
            onStatChange={(statIndex, newValue) => {
              if (currentPolyList) {
                const updatedStats = [...currentPolyList.stats];
                updatedStats[statIndex] = {
                  ...updatedStats[statIndex],
                  value: newValue,
                };
                handlePolyListUpdate(currentPolyList.id, {
                  stats: updatedStats,
                });
              }
            }}
            isDraggable={isDraggable}
          />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
              statCount={statCount}
              onStatCountChange={handleStatCountChange}
              currentPolyList={currentPolyList}
              statNames={statNames}
              onStatChange={(index, change) => {
                if (currentPolyList) {
                  const updatedStats = [...currentPolyList.stats];
                  updatedStats[index] = {
                    ...updatedStats[index],
                    ...change,
                  };
                  handlePolyListUpdate(currentPolyList.id, {
                    stats: updatedStats,
                  });
                }
              }}
              onSortingChange={setSortingConfigs}
              polyLists={sortedPolyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={handlePolyListSelect}
              onAddPolyList={handleAddPolyList}
              isDraggable={isDraggable}
              onDraggableToggle={setIsDraggable}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
