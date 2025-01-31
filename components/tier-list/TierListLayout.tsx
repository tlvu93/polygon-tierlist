"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  const [currentDiagramId, setCurrentDiagramId] = useState("");
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const supabase = createClient();

  // Load diagrams and properties
  const loadDiagrams = useCallback(async () => {
    if (!id) return;

    try {
      const { data: diagramsData, error: diagramsError } = await supabase
        .from("diagrams")
        .select("id, name, thumbnail, position")
        .eq("tier_list_id", id)
        .order("position");

      if (diagramsError) throw diagramsError;

      const loadedDiagrams: Diagram[] = [];

      for (const diagram of diagramsData || []) {
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("diagram_properties")
          .select("name, value")
          .eq("diagram_id", diagram.id)
          .order("position");

        if (propertiesError) throw propertiesError;

        loadedDiagrams.push({
          id: diagram.id,
          name: diagram.name,
          thumbnail: diagram.thumbnail,
          properties: propertiesData || [],
        });
      }

      setDiagrams(loadedDiagrams);
      if (loadedDiagrams.length > 0) {
        setCurrentDiagramId(loadedDiagrams[0].id);
      }
    } catch (error) {
      console.error("Error loading diagrams:", error);
    }
  }, [id, supabase]);

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  const currentDiagram = useMemo(() => diagrams.find((d) => d.id === currentDiagramId), [diagrams, currentDiagramId]);

  // Pre-compute property names for the current diagram
  const propertyNames = useMemo(() => {
    return Array(propertyCount)
      .fill(null)
      .map((_, i) => currentDiagram?.properties[i]?.name || `Property ${i + 1}`);
  }, [propertyCount, currentDiagram]);

  // Handle property count changes
  const handlePropertyCountChange = useCallback(
    async (newCount: number) => {
      if (!id) return;

      try {
        const updatedDiagrams = [...diagrams];

        for (let i = 0; i < updatedDiagrams.length; i++) {
          const diagram = updatedDiagrams[i];
          let newProperties = [...diagram.properties];

          if (newProperties.length < newCount) {
            // Add new properties
            const additionalProperties = Array(newCount - newProperties.length)
              .fill(null)
              .map((_, i) => ({
                diagram_id: diagram.id,
                name: `Property ${newProperties.length + i + 1}`,
                value: 5,
                position: newProperties.length + i,
              }));

            const { error } = await supabase.from("diagram_properties").insert(additionalProperties);
            if (error) throw error;

            newProperties = [...newProperties, ...additionalProperties.map((p) => ({ name: p.name, value: p.value }))];
          } else if (newProperties.length > newCount) {
            // Remove excess properties
            const { error } = await supabase
              .from("diagram_properties")
              .delete()
              .eq("diagram_id", diagram.id)
              .gte("position", newCount);

            if (error) throw error;
            newProperties = newProperties.slice(0, newCount);
          }

          updatedDiagrams[i] = { ...diagram, properties: newProperties };
        }

        setDiagrams(updatedDiagrams);
        setPropertyCount(newCount);
      } catch (error) {
        console.error("Error updating properties:", error);
      }
    },
    [diagrams, id, supabase]
  );

  const handlePropertyChange = useCallback(
    async (index: number, change: Partial<DiagramProperty>) => {
      if (!currentDiagram) return;

      try {
        // First update the database
        const { error } = await supabase.from("diagram_properties").upsert({
          diagram_id: currentDiagram.id,
          name: change.name || `Property ${index + 1}`,
          value: change.value || 5,
          position: index,
        });

        if (error) throw error;

        // Then update local state
        setDiagrams((prevDiagrams) => {
          const updatedDiagram = { ...currentDiagram };
          const newProperties = [...updatedDiagram.properties];

          if (index >= newProperties.length) {
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

          updatedDiagram.properties = newProperties;

          return prevDiagrams.map((diagram) => (diagram.id === currentDiagramId ? updatedDiagram : diagram));
        });
      } catch (error) {
        console.error("Error updating property:", error);
      }
    },
    [currentDiagram, currentDiagramId, supabase]
  );

  const handleAddDiagram = useCallback(async () => {
    if (!id) return;

    try {
      // Insert new diagram
      const { data: newDiagram, error: diagramError } = await supabase
        .from("diagrams")
        .insert({
          tier_list_id: id,
          name: `New Diagram ${diagrams.length + 1}`,
          position: diagrams.length,
        })
        .select()
        .single();

      if (diagramError) throw diagramError;

      // Insert properties for the new diagram
      const properties = Array(propertyCount)
        .fill(null)
        .map((_, i) => ({
          diagram_id: newDiagram.id,
          name: `Property ${i + 1}`,
          value: 5,
          position: i,
        }));

      const { data: propertiesData, error: propertiesError } = await supabase
        .from("diagram_properties")
        .insert(properties)
        .select();

      if (propertiesError) throw propertiesError;

      const newDiagramWithProperties: Diagram = {
        id: newDiagram.id,
        name: newDiagram.name,
        thumbnail: newDiagram.thumbnail,
        properties: propertiesData.map((p) => ({ name: p.name, value: p.value })),
      };

      setDiagrams((prevDiagrams) => [...prevDiagrams, newDiagramWithProperties]);
      setCurrentDiagramId(newDiagram.id);
    } catch (error) {
      console.error("Error adding diagram:", error);
    }
  }, [id, diagrams.length, propertyCount, supabase]);

  const handleDiagramDelete = useCallback(
    async (diagramId: string) => {
      if (!id) return;

      try {
        const { error } = await supabase.from("diagrams").delete().eq("id", diagramId);
        if (error) throw error;

        setDiagrams((prevDiagrams) => {
          const filteredDiagrams = prevDiagrams.filter((d) => d.id !== diagramId);
          if (currentDiagramId === diagramId) {
            setCurrentDiagramId(filteredDiagrams.length > 0 ? filteredDiagrams[0].id : "");
          }
          return filteredDiagrams;
        });
      } catch (error) {
        console.error("Error deleting diagram:", error);
      }
    },
    [id, currentDiagramId, supabase]
  );

  const handleDiagramNameChange = useCallback(
    async (diagramId: string, name: string) => {
      if (!id) return;

      try {
        const { error } = await supabase
          .from("diagrams")
          .update({ name, updated_at: new Date().toISOString() })
          .eq("id", diagramId);

        if (error) throw error;

        setDiagrams((prevDiagrams) => prevDiagrams.map((d) => (d.id === diagramId ? { ...d, name } : d)));
      } catch (error) {
        console.error("Error updating diagram name:", error);
      }
    },
    [id, supabase]
  );

  const handleTierListNameChange = useCallback(
    async (newName: string) => {
      if (!id) return;

      try {
        const { error } = await supabase
          .from("tier_lists")
          .update({ title: newName, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) throw error;
        setTierListName(newName);
      } catch (error) {
        console.error("Error updating tier list name:", error);
      }
    },
    [id, supabase]
  );

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
            onDiagramDelete={handleDiagramDelete}
            onDiagramNameChange={handleDiagramNameChange}
          />
        </div>
        <Sidebar
          propertyCount={propertyCount}
          onPropertyCountChange={handlePropertyCountChange}
          currentDiagram={currentDiagram}
          propertyNames={propertyNames}
          onPropertyChange={handlePropertyChange}
        />
      </div>
    </div>
  );
}
