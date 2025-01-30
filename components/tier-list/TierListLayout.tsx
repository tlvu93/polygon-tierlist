"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import DiagramList from "./DiagramList";
import { createClient } from "@/utils/supabase/client";

import { Diagram, DiagramProperty } from "./types";

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
  const [currentDiagramId, setCurrentDiagramId] = useState("1");
  const [diagrams, setDiagrams] = useState<Diagram[]>([
    {
      id: "1",
      name: "Main Diagram",
      properties: [
        { name: "Property 1", value: 7 },
        { name: "Property 2", value: 5 },
        { name: "Property 3", value: 8 },
        { name: "Property 4", value: 6 },
        { name: "Property 5", value: 7 },
      ],
    },
    {
      id: "2",
      name: "Alternative View",
      properties: [
        { name: "Property 1", value: 4 },
        { name: "Property 2", value: 8 },
        { name: "Property 3", value: 6 },
        { name: "Property 4", value: 7 },
        { name: "Property 5", value: 5 },
      ],
    },
    {
      id: "3",
      name: "Simplified",
      properties: [
        { name: "Property 1", value: 6 },
        { name: "Property 2", value: 6 },
        { name: "Property 3", value: 6 },
        { name: "Property 4", value: 6 },
        { name: "Property 5", value: 6 },
      ],
    },
  ]);

  const currentDiagram = useMemo(() => diagrams.find((d) => d.id === currentDiagramId), [diagrams, currentDiagramId]);

  // Pre-compute property names for the current diagram
  const propertyNames = useMemo(() => {
    return Array(propertyCount)
      .fill(null)
      .map((_, i) => currentDiagram?.properties[i]?.name || `Property ${i + 1}`);
  }, [propertyCount, currentDiagram]);

  // Update all diagrams when property count changes
  useEffect(() => {
    setDiagrams((prevDiagrams) =>
      prevDiagrams.map((diagram) => {
        let newProperties = [...diagram.properties];
        if (newProperties.length < propertyCount) {
          // Add new properties
          newProperties = [
            ...newProperties,
            ...Array(propertyCount - newProperties.length)
              .fill(null)
              .map((_, i) => ({
                name: `Property ${newProperties.length + i + 1}`,
                value: 5,
              })),
          ];
        } else if (newProperties.length > propertyCount) {
          // Remove excess properties
          newProperties = newProperties.slice(0, propertyCount);
        }
        return { ...diagram, properties: newProperties };
      })
    );
  }, [propertyCount]);

  const handlePropertyChange = (index: number, change: Partial<DiagramProperty>) => {
    if (!currentDiagram) return;

    const newProperties = [...currentDiagram.properties];
    if (index >= newProperties.length) {
      // Add new properties if needed
      while (newProperties.length <= index) {
        newProperties.push({
          name: `Property ${newProperties.length + 1}`,
          value: 5,
        });
      }
    }
    newProperties[index] = {
      ...newProperties[index],
      ...change,
    };

    setDiagrams(
      diagrams.map((diagram) => (diagram.id === currentDiagramId ? { ...diagram, properties: newProperties } : diagram))
    );
  };

  const handleAddDiagram = () => {
    const newId = String(diagrams.length + 1);
    const newDiagram: Diagram = {
      id: newId,
      name: `New Diagram ${newId}`,
      properties: Array(propertyCount)
        .fill(null)
        .map((_, i) => ({
          name: `Property ${i + 1}`,
          value: 5,
        })),
    };
    setDiagrams([...diagrams, newDiagram]);
    setCurrentDiagramId(newId);
  };

  const handleTierListNameChange = async (newName: string) => {
    if (!id) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tier_lists")
        .update({ title: newName, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setTierListName(newName);
    } catch (error) {
      console.error("Error updating tier list name:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header tierListName={tierListName} isLoggedIn={true} onTierListNameChange={handleTierListNameChange} />
      <div className="flex flex-1 overflow-hidden">
        <DiagramList
          diagrams={diagrams}
          currentDiagramId={currentDiagramId}
          onDiagramSelect={setCurrentDiagramId}
          onAddDiagram={handleAddDiagram}
        />
        <div className="w-[60%]">
          <MainContent
            diagrams={diagrams}
            currentDiagramId={currentDiagramId}
            onDiagramSelect={setCurrentDiagramId}
            onDiagramDelete={(id) => {
              setDiagrams(diagrams.filter((d) => d.id !== id));
              if (currentDiagramId === id && diagrams.length > 1) {
                const newDiagram = diagrams.find((d) => d.id !== id);
                if (newDiagram) {
                  setCurrentDiagramId(newDiagram.id);
                }
              }
            }}
            onDiagramNameChange={(id, name) => {
              setDiagrams(diagrams.map((d) => (d.id === id ? { ...d, name } : d)));
            }}
          />
        </div>
        <Sidebar
          propertyCount={propertyCount}
          onPropertyCountChange={setPropertyCount}
          currentDiagram={currentDiagram}
          propertyNames={propertyNames}
          onPropertyChange={handlePropertyChange}
        />
      </div>
    </div>
  );
}
