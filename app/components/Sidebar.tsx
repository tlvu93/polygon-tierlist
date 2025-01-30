"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function Sidebar() {
  const [currentTab, setCurrentTab] = useState("editor")

  return (
    <div className="w-1/3 p-6 bg-slate-50 border-l overflow-auto">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="sorting">Sorting</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Current Item Editor</h3>
            <Input className="mb-4" placeholder="Item name" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Comfort</label>
                <Slider defaultValue={[5]} max={10} step={1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sound</label>
                <Slider defaultValue={[5]} max={10} step={1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Battery</label>
                <Slider defaultValue={[5]} max={10} step={1} />
              </div>
            </div>
            <Button className="w-full mt-4">Save Changes</Button>
          </Card>
        </TabsContent>
        <TabsContent value="sorting">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Sorting & Formulas</h3>
            {/* Add sorting and formula content here */}
          </Card>
        </TabsContent>
        <TabsContent value="sharing">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Sharing & Export</h3>
            {/* Add sharing and export content here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

