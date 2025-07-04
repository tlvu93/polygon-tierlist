"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import DiagramList from "./DiagramList";
import { Diagram } from "./types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortingConfig {
  property: number;
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
  const [propertyCount, setPropertyCount] = useState(5);
  const [currentDiagramId, setCurrentDiagramId] = useState("");
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256); // px
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256); // px
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const minSidebarWidth = 160;
  const maxSidebarWidth = 400;

  // Load diagrams and properties from localStorage
  const loadDiagrams = useCallback(() => {
    if (!id) return;

    try {
      const tierListData = localStorage.getItem(`tierlist-${id}`);
      if (tierListData) {
        const data = JSON.parse(tierListData);
        setDiagrams(data.diagrams || []);
        setCurrentDiagramId(data.currentDiagramId || "");
        setTierListName(data.name || initialTierListName);
        setPropertyCount(data.propertyCount || 5);
        setSortingConfigs(data.sortingConfigs || []);
      } else {
        // Create a default diagram if none exist
        const defaultDiagram: Diagram = {
          id: `diagram-${Date.now()}`,
          name: "Default Diagram",
          thumbnail: "/placeholder.svg",
          properties: Array(propertyCount)
            .fill(null)
            .map((_, i) => ({
              name: `Property ${i + 1}`,
              value: 5,
            })),
        };

        setDiagrams([defaultDiagram]);
        setCurrentDiagramId(defaultDiagram.id);

        // Save to localStorage
        saveToLocalStorage([defaultDiagram], defaultDiagram.id);
      }
    } catch (error) {
      console.error("Error loading diagrams:", error);
    }
  }, [id, propertyCount, initialTierListName]);

  // Save to localStorage
  const saveToLocalStorage = (
    diagrams: Diagram[],
    currentDiagramId: string
  ) => {
    if (!id) return;

    const tierListData = {
      name: tierListName,
      diagrams: diagrams,
      currentDiagramId: currentDiagramId,
      propertyCount: propertyCount,
      sortingConfigs: sortingConfigs,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(`tierlist-${id}`, JSON.stringify(tierListData));
  };

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  // Auto-save when data changes
  useEffect(() => {
    if (diagrams.length > 0 && currentDiagramId) {
      saveToLocalStorage(diagrams, currentDiagramId);
    }
  }, [diagrams, currentDiagramId, tierListName, propertyCount, sortingConfigs]);

  const currentDiagram = useMemo(
    () => diagrams.find((d) => d.id === currentDiagramId),
    [diagrams, currentDiagramId]
  );

  const sortedDiagrams = useMemo(() => {
    if (sortingConfigs.length === 0) return diagrams;

    return [...diagrams].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const totalWeight = sortingConfigs.reduce(
        (sum, config) => sum + config.weight,
        0
      );

      // Normalize weights if total is not 1
      const normalizer = totalWeight === 0 ? 1 : totalWeight;

      sortingConfigs.forEach((config) => {
        const propA = a.properties[config.property]?.value || 0;
        const propB = b.properties[config.property]?.value || 0;
        const normalizedWeight = config.weight / normalizer;

        scoreA += propA * normalizedWeight;
        scoreB += propB * normalizedWeight;
      });

      return scoreB - scoreA; // Sort in descending order (highest score first)
    });
  }, [diagrams, sortingConfigs]);

  // Pre-compute property names for the current diagram
  const propertyNames = useMemo(() => {
    return Array(propertyCount)
      .fill(null)
      .map(
        (_, i) => currentDiagram?.properties[i]?.name || `Property ${i + 1}`
      );
  }, [propertyCount, currentDiagram]);

  // Handle property count changes
  const handlePropertyCountChange = useCallback(
    (newCount: number) => {
      if (!id) return;

      try {
        const updatedDiagrams = [...diagrams];

        for (let i = 0; i < updatedDiagrams.length; i++) {
          const diagram = updatedDiagrams[i];
          let newProperties = [...diagram.properties];

          if (newProperties.length < newCount) {
            // Add new properties with consistent names
            const additionalProperties = Array(newCount - newProperties.length)
              .fill(null)
              .map((_, i) => {
                const propertyIndex = newProperties.length + i;
                // Look for existing property name at this index across all diagrams
                const existingName = diagrams.find(
                  (d) => d.properties[propertyIndex]?.name
                )?.properties[propertyIndex].name;
                return {
                  name: existingName || `Property ${propertyIndex + 1}`,
                  value: 5,
                };
              });

            newProperties = [...newProperties, ...additionalProperties];
          } else if (newProperties.length > newCount) {
            // Remove excess properties
            newProperties = newProperties.slice(0, newCount);
          }

          updatedDiagrams[i] = { ...diagram, properties: newProperties };
        }

        setDiagrams(updatedDiagrams);
        setPropertyCount(newCount);
      } catch (error) {
        console.error("Error updating property count:", error);
      }
    },
    [id, diagrams]
  );

  const handleDiagramSelect = useCallback((diagramId: string) => {
    setCurrentDiagramId(diagramId);
  }, []);

  const handleDiagramUpdate = useCallback(
    (diagramId: string, updates: Partial<Diagram>) => {
      setDiagrams((prev) =>
        prev.map((d) => (d.id === diagramId ? { ...d, ...updates } : d))
      );
    },
    []
  );

  const handleDiagramDelete = useCallback(
    (diagramId: string) => {
      setDiagrams((prev) => prev.filter((d) => d.id !== diagramId));
      if (currentDiagramId === diagramId) {
        const remainingDiagrams = diagrams.filter((d) => d.id !== diagramId);
        setCurrentDiagramId(remainingDiagrams[0]?.id || "");
      }
    },
    [currentDiagramId, diagrams]
  );

  const handleAddDiagram = useCallback(() => {
    const newDiagram: Diagram = {
      id: `diagram-${Date.now()}`,
      name: `Diagram ${diagrams.length + 1}`,
      thumbnail: "/placeholder.svg",
      properties: Array(propertyCount)
        .fill(null)
        .map((_, i) => ({
          name: `Property ${i + 1}`,
          value: 5,
        })),
    };

    setDiagrams((prev) => [...prev, newDiagram]);
    setCurrentDiagramId(newDiagram.id);
  }, [diagrams.length, propertyCount]);

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
            <DiagramList
              diagrams={sortedDiagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={handleDiagramSelect}
              onAddDiagram={handleAddDiagram}
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
            diagrams={diagrams}
            currentDiagramId={currentDiagramId}
            onDiagramSelect={handleDiagramSelect}
            onDiagramDelete={handleDiagramDelete}
            onDiagramNameChange={(id, name) =>
              handleDiagramUpdate(id, { name })
            }
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
              propertyCount={propertyCount}
              onPropertyCountChange={handlePropertyCountChange}
              currentDiagram={currentDiagram}
              propertyNames={propertyNames}
              onPropertyChange={(index, change) => {
                if (currentDiagram) {
                  const updatedProperties = [...currentDiagram.properties];
                  updatedProperties[index] = {
                    ...updatedProperties[index],
                    ...change,
                  };
                  handleDiagramUpdate(currentDiagram.id, {
                    properties: updatedProperties,
                  });
                }
              }}
              onSortingChange={setSortingConfigs}
              diagrams={sortedDiagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={handleDiagramSelect}
              onAddDiagram={handleAddDiagram}
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
            diagrams={diagrams}
            currentDiagramId={currentDiagramId}
            onDiagramSelect={handleDiagramSelect}
            onDiagramDelete={handleDiagramDelete}
            onDiagramNameChange={(id, name) =>
              handleDiagramUpdate(id, { name })
            }
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
              propertyCount={propertyCount}
              onPropertyCountChange={handlePropertyCountChange}
              currentDiagram={currentDiagram}
              propertyNames={propertyNames}
              onPropertyChange={(index, change) => {
                if (currentDiagram) {
                  const updatedProperties = [...currentDiagram.properties];
                  updatedProperties[index] = {
                    ...updatedProperties[index],
                    ...change,
                  };
                  handleDiagramUpdate(currentDiagram.id, {
                    properties: updatedProperties,
                  });
                }
              }}
              onSortingChange={setSortingConfigs}
              diagrams={sortedDiagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={handleDiagramSelect}
              onAddDiagram={handleAddDiagram}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
