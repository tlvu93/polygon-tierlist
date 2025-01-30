"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const mockData = [
  { id: 1, name: "Sony XM5", comfort: 9, sound: 8, battery: 10 },
  { id: 2, name: "Bose QC45", comfort: 8, sound: 7, battery: 9 },
  { id: 3, name: "AirPods Max", comfort: 7, sound: 9, battery: 8 },
]

export default function MainContent() {
  const [view, setView] = useState<"diagram" | "table">("diagram")

  return (
    <main className="flex-1 p-6 overflow-auto">
      <Card className="p-6">
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => setView(view === "diagram" ? "table" : "diagram")}>
            {view === "diagram" ? "Switch to Table" : "Switch to Diagram"}
          </Button>
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
                <TableHead>Comfort</TableHead>
                <TableHead>Sound</TableHead>
                <TableHead>Battery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.comfort}</TableCell>
                  <TableCell>{item.sound}</TableCell>
                  <TableCell>{item.battery}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  )
}

