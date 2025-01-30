"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Plus, MinusCircle, PlusCircle } from "lucide-react";

interface TierListItem {
  id: number;
  name: string;
  [key: `property${number}`]: number;
}

const generateMockData = (propertyCount: number): TierListItem[] => {
  const properties = Array.from({ length: propertyCount }, (_, i) => `property${i + 1}`);
  return [
    {
      id: 1,
      name: "Sony XM5",
      ...Object.fromEntries(properties.map((prop) => [prop, Math.floor(Math.random() * 10) + 1])),
    },
    {
      id: 2,
      name: "Bose QC45",
      ...Object.fromEntries(properties.map((prop) => [prop, Math.floor(Math.random() * 10) + 1])),
    },
    {
      id: 3,
      name: "AirPods Max",
      ...Object.fromEntries(properties.map((prop) => [prop, Math.floor(Math.random() * 10) + 1])),
    },
  ];
};

export default function MainContent() {
  const [view, setView] = useState<"diagram" | "table">("diagram");
  const [propertyCount, setPropertyCount] = useState(3);

  const mockData = useMemo(() => generateMockData(propertyCount), [propertyCount]);
  const properties = useMemo(
    () => Array.from({ length: propertyCount }, (_, i) => `Property ${i + 1}`),
    [propertyCount]
  );

  const handlePropertyCountChange = (increment: boolean) => {
    setPropertyCount((prev) => {
      const newCount = increment ? prev + 1 : prev - 1;
      return Math.min(Math.max(newCount, 3), 8); // Clamp between 3 and 8
    });
  };

  return (
    <main className="flex-1 p-6 overflow-auto">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setView(view === "diagram" ? "table" : "diagram")}>
              {view === "diagram" ? "Switch to Table" : "Switch to Diagram"}
            </Button>

            <div className="flex items-center gap-2 ml-4">
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

          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {view === "diagram" ? (
          <div className="relative aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
            <span className="text-slate-400">Tier List Diagram Placeholder</span>
            <Button variant="outline" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button variant="outline" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {properties.map((prop, index) => (
                  <TableHead key={index}>{prop}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {properties.map((prop, index) => (
                    <TableCell key={index}>{item[`property${index + 1}`]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  );
}
