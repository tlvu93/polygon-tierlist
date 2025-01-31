"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Diagram, DiagramProperty } from "./types";

interface SortingConfig {
  property: number;
  weight: number;
}

interface SidebarProps {
  propertyCount: number;
  onPropertyCountChange: (count: number) => void;
  currentDiagram?: Diagram;
  propertyNames: string[];
  onPropertyChange: (index: number, change: Partial<DiagramProperty>) => void;
  onSortingChange: (sortingConfigs: SortingConfig[]) => void;
}

export default function Sidebar({
  propertyCount,
  onPropertyCountChange,
  currentDiagram,
  propertyNames,
  onPropertyChange,
  onSortingChange,
}: SidebarProps) {
  const [currentTab, setCurrentTab] = useState("editor");
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);

  const handlePropertyCountChange = (increment: boolean) => {
    const newCount = increment ? propertyCount + 1 : propertyCount - 1;
    onPropertyCountChange(Math.min(Math.max(newCount, 3), 8)); // Clamp between 3 and 8
  };

  return (
    <aside className="w-[20%] min-w-[200px] bg-slate-100 border-l overflow-auto">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card className="p-3">
            <div className="space-y-6">
              {/* General Settings Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">General Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm mb-1 block">Properties</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePropertyCountChange(false)}
                        disabled={propertyCount <= 3}
                      >
                        <MinusCircle className="w-4 h-4" />
                      </Button>
                      <span className="min-w-[4rem] text-center">{propertyCount} props</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePropertyCountChange(true)}
                        disabled={propertyCount >= 8}
                      >
                        <PlusCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Properties Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">Properties</h3>
                <div className="space-y-4">
                  {Array.from({ length: propertyCount }, (_, i) => (
                    <div key={i}>
                      <div className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1">
                        <input
                          type="text"
                          value={propertyNames[i]}
                          onChange={(e) => {
                            onPropertyChange(i, { name: e.target.value });
                          }}
                          className="w-full bg-transparent border-0 outline-none border-b border-solid border-slate-200 hover:border-slate-400 focus:border-slate-400 px-1"
                        />
                      </div>
                      <Slider
                        value={[currentDiagram?.properties[i]?.value ?? 5]}
                        onValueChange={([value]) => {
                          onPropertyChange(i, { value });
                        }}
                        max={10}
                        step={1}
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
            <h3 className="text-lg font-semibold mb-3">Sorting Configuration</h3>
            <div className="space-y-4">
              {sortingConfigs.map((config, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <select
                      className="w-2/3 p-2 border rounded-md"
                      value={config.property}
                      onChange={(e) => {
                        const newConfigs = [...sortingConfigs];
                        newConfigs[index].property = parseInt(e.target.value);
                        setSortingConfigs(newConfigs);
                        onSortingChange(newConfigs);
                      }}
                    >
                      {Array.from({ length: propertyCount }, (_, i) => (
                        <option key={i} value={i}>
                          {propertyNames[i]}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newConfigs = sortingConfigs.filter((_, i) => i !== index);
                        setSortingConfigs(newConfigs);
                        onSortingChange(newConfigs);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-slate-500">Weight: {config.weight.toFixed(1)}</label>
                    <Slider
                      value={[config.weight]}
                      onValueChange={([value]) => {
                        const newConfigs = [...sortingConfigs];
                        newConfigs[index].weight = value;
                        setSortingConfigs(newConfigs);
                        onSortingChange(newConfigs);
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
                  const newConfigs = [...sortingConfigs, { property: 0, weight: 1 }];
                  setSortingConfigs(newConfigs);
                  onSortingChange(newConfigs);
                }}
                disabled={sortingConfigs.length >= propertyCount}
              >
                Add Property
              </Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="sharing">
          <Card className="p-3">
            <h3 className="text-lg font-semibold mb-3">Sharing & Export</h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Copy Link
              </Button>
              <Button variant="outline" className="w-full">
                Export as PNG
              </Button>
              <Button variant="outline" className="w-full">
                Export as CSV
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
