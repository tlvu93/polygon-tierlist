"use client";

import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MinusCircle, PlusCircle, Copy, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PolyList, Stat } from "./types";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import PolyListList from "./PolyListList";

interface SortingConfig {
  stat: number;
  weight: number;
}

interface SidebarProps {
  statCount: number;
  onStatCountChange: (count: number) => void;
  currentPolyList?: PolyList;
  statNames: string[];
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
  onStatChange,
  onSortingChange,
  polyLists,
  currentPolyListId,
  onPolyListSelect,
  onAddPolyList,
  isDraggable = false,
  onDraggableToggle,
}: SidebarProps) {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("editor");
  const [isPending, startTransition] = useTransition();
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [localStatNames, setLocalStatNames] = useState<string[]>(
    currentPolyList?.stats.map((p) => p.name) || statNames
  );
  const [localStatValues, setLocalStatValues] = useState<number[]>(
    Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.value ?? 5
    )
  );

  // Update local state when current polyList changes
  useEffect(() => {
    if (currentPolyList) {
      setLocalStatNames(currentPolyList.stats.map((p) => p.name));
      setLocalStatValues(
        Array.from(
          { length: statCount },
          (_, i) => currentPolyList.stats[i]?.value ?? 5
        )
      );
    }
  }, [currentPolyList, statCount]);

  const debouncedStatNameChange = useDebounce((index: number, name: string) => {
    startTransition(() => {
      onStatChange(index, { name });
    });
  }, 1000);

  const debouncedStatValueChange = useDebounce(
    (index: number, value: number) => {
      startTransition(() => {
        onStatChange(index, { value });
      });
    },
    150
  );

  const debouncedSortingChange = useDebounce((configs: SortingConfig[]) => {
    startTransition(() => {
      onSortingChange(configs);
    });
  }, 150);

  const handleStatCountChange = (increment: boolean) => {
    const newCount = increment ? statCount + 1 : statCount - 1;
    onStatCountChange(Math.min(Math.max(newCount, 3), 8)); // Clamp between 3 and 8
  };

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
          <Card className="p-3">
            <div className="space-y-6">
              {/* General Settings Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  General Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm mb-1 block">Stats</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatCountChange(false)}
                        disabled={statCount <= 3}
                      >
                        <MinusCircle className="w-4 h-4" />
                      </Button>
                      <span className="min-w-[4rem] text-center">
                        {statCount} stats
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatCountChange(true)}
                        disabled={statCount >= 8}
                      >
                        <PlusCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {onDraggableToggle && (
                    <div>
                      <label className="text-sm mb-1 block">Interaction</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="draggable-toggle"
                          checked={isDraggable}
                          onChange={(e) => onDraggableToggle(e.target.checked)}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label
                          htmlFor="draggable-toggle"
                          className="text-sm text-gray-700"
                        >
                          Draggable Stats
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Stats Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  Stats
                </h3>
                <div className="space-y-4">
                  {Array.from({ length: statCount }, (_, i) => (
                    <div key={i}>
                      <div className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1">
                        <input
                          type="text"
                          value={localStatNames[i]}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setLocalStatNames((prev) => {
                              const updated = [...prev];
                              updated[i] = newValue;
                              return updated;
                            });
                            debouncedStatNameChange(i, newValue);
                          }}
                          className={`w-full bg-transparent border-0 outline-none border-b border-solid border-slate-200 hover:border-slate-400 focus:border-slate-400 px-1 ${
                            isPending ? "text-slate-400" : ""
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">
                          Value: {localStatValues[i].toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[localStatValues[i]]}
                        onValueChange={([value]) => {
                          setLocalStatValues((prev) => {
                            const updated = [...prev];
                            updated[i] = value;
                            return updated;
                          });
                          requestAnimationFrame(() => {
                            debouncedStatValueChange(i, value);
                          });
                        }}
                        max={10}
                        step={0.1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="sorting">
          <Card className="p-3">
            <h3 className="text-lg font-semibold mb-3">
              Sorting Configuration
            </h3>
            <div className="space-y-4">
              {sortingConfigs.map((config, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <select
                      className={`w-2/3 p-2 border rounded-md ${
                        isPending ? "text-slate-400" : ""
                      }`}
                      value={config.stat}
                      onChange={(e) => {
                        const newConfigs = [...sortingConfigs];
                        newConfigs[index].stat = parseInt(e.target.value);
                        setSortingConfigs(newConfigs);
                        debouncedSortingChange(newConfigs);
                      }}
                    >
                      {Array.from({ length: statCount }, (_, i) => (
                        <option key={i} value={i}>
                          {currentPolyList?.stats[i]?.name || statNames[i]}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newConfigs = sortingConfigs.filter(
                          (_, i) => i !== index
                        );
                        setSortingConfigs(newConfigs);
                        debouncedSortingChange(newConfigs);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-500">
                      Weight: {config.weight.toFixed(1)}
                    </label>
                    <Slider
                      value={[config.weight]}
                      onValueChange={([value]) => {
                        const newConfigs = [...sortingConfigs];
                        newConfigs[index].weight = value;
                        setSortingConfigs(newConfigs); // Update local state immediately
                        requestAnimationFrame(() => {
                          debouncedSortingChange(newConfigs); // Debounce server update
                        });
                      }}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const newConfigs = [
                    ...sortingConfigs,
                    { stat: 0, weight: 1 },
                  ];
                  setSortingConfigs(newConfigs);
                  debouncedSortingChange(newConfigs);
                }}
                disabled={sortingConfigs.length >= statCount}
              >
                Add Stat
              </Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="sharing">
          <Card className="p-3">
            <h3 className="text-lg font-semibold mb-3">Sharing & Export</h3>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).then(() => {
                    toast({
                      title: "Link copied",
                      description: "The URL has been copied to your clipboard",
                    });
                  });
                }}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={async () => {
                  const mainContent = document.querySelector(".main-content");
                  if (mainContent) {
                    try {
                      const canvas = await html2canvas(
                        mainContent as HTMLElement,
                        {
                          backgroundColor: "#ffffff",
                        }
                      );
                      const dataUrl = canvas.toDataURL("image/png");
                      const link = document.createElement("a");
                      link.download = `${
                        currentPolyList?.name || "polyList"
                      }.png`;
                      link.href = dataUrl;
                      link.click();
                      toast({
                        title: "Export successful",
                        description: "The polyList has been exported as PNG",
                      });
                    } catch {
                      toast({
                        title: "Export failed",
                        description: "Failed to export the polyList",
                        variant: "destructive",
                      });
                    }
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Export as PNG
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  if (!polyLists.length) return;

                  // Get all unique stat names from all polyLists
                  const allStatNames = new Set<string>();
                  polyLists.forEach((polyList) => {
                    polyList.stats.forEach((stat) => {
                      allStatNames.add(stat.name);
                    });
                  });

                  // Create headers
                  const headers = ["Name", ...Array.from(allStatNames)];

                  // Create rows for each polyList
                  const rows = polyLists.map((polyList) => {
                    const values = [polyList.name];
                    Array.from(allStatNames).forEach((statName) => {
                      const stat = polyList.stats.find(
                        (s) => s.name === statName
                      );
                      values.push(stat ? stat.value.toString() : "");
                    });
                    return values;
                  });

                  // Combine headers and rows
                  const csvContent = [
                    headers.join(","),
                    ...rows.map((row) => row.join(",")),
                  ].join("\n");

                  // Create and trigger download
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "polygon-tier-list.csv";
                  link.click();
                  window.URL.revokeObjectURL(url);

                  toast({
                    title: "Export successful",
                    description: "The polyList has been exported as CSV",
                  });
                }}
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="polyLists" className="block lg:hidden">
          <Card className="p-3">
            <PolyListList
              polyLists={polyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={onPolyListSelect}
              onAddPolyList={onAddPolyList}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
