"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MinusCircle, PlusCircle } from "lucide-react";

interface SidebarProps {
  propertyCount: number;
  onPropertyCountChange: (count: number) => void;
}

export default function Sidebar({ propertyCount, onPropertyCountChange }: SidebarProps) {
  const [currentTab, setCurrentTab] = useState("editor");
  const [propertyNames, setPropertyNames] = useState<string[]>(
    Array(propertyCount)
      .fill("")
      .map((_, i) => `Property ${i + 1}`)
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    // Update property names when count changes
    setPropertyNames((prev) => {
      if (prev.length < propertyCount) {
        // Add new properties
        return [
          ...prev,
          ...Array(propertyCount - prev.length)
            .fill("")
            .map((_, i) => `Property ${prev.length + i + 1}`),
        ];
      } else if (prev.length > propertyCount) {
        // Remove excess properties
        return prev.slice(0, propertyCount);
      }
      return prev;
    });
  }, [propertyCount]);

  const handlePropertyCountChange = (increment: boolean) => {
    const newCount = increment ? propertyCount + 1 : propertyCount - 1;
    onPropertyCountChange(Math.min(Math.max(newCount, 3), 8)); // Clamp between 3 and 8
  };

  return (
    <aside className="w-[25%] min-w-[250px] p-4 bg-slate-50 border-l overflow-auto">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card className="p-3">
            <h3 className="text-lg font-semibold mb-3">Current Item Editor</h3>
            <div className="flex items-center gap-2 mb-3">
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
            <Input className="mb-3" placeholder="Item name" />
            <div className="space-y-4">
              {Array.from({ length: propertyCount }, (_, i) => (
                <div key={i}>
                  <div
                    onClick={() => setEditingIndex(i)}
                    className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1"
                  >
                    {editingIndex === i ? (
                      <input
                        type="text"
                        value={propertyNames[i]}
                        onChange={(e) => {
                          const newNames = [...propertyNames];
                          newNames[i] = e.target.value;
                          setPropertyNames(newNames);
                        }}
                        onBlur={() => setEditingIndex(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingIndex(null);
                          }
                        }}
                        className="w-full bg-transparent border-0 outline-none border-b-2 border-solid border-slate-400"
                        autoFocus
                      />
                    ) : (
                      <span>{propertyNames[i]}</span>
                    )}
                  </div>
                  <Slider defaultValue={[5]} max={10} step={1} />
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">Save Changes</Button>
          </Card>
        </TabsContent>
        <TabsContent value="sorting">
          <Card className="p-3">
            <h3 className="text-lg font-semibold mb-3">Sorting & Formulas</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Formula</label>
                <select className="w-full p-2 border rounded-md">
                  <option>Weighted Average</option>
                  <option>Simple Average</option>
                </select>
              </div>
              <Button variant="outline" className="w-full">
                New Formula
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
