"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import DiagramList from "./DiagramList";
import { createClient } from "@/utils/supabase/client";
import { Diagram, DiagramProperty } from "./types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight } from "lucide-react";
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

      if (loadedDiagrams.length === 0) {
        // Create a default diagram if none exist
        const { data: newDiagram, error: diagramError } = await supabase
          .from("diagrams")
          .insert({
            tier_list_id: id,
            name: "Default Diagram",
            position: 0,
          })
          .select()
          .single();

        if (diagramError) throw diagramError;

        // Insert default properties for the new diagram
        const defaultProperties = Array(propertyCount)
          .fill(null)
          .map((_, i) => ({
            diagram_id: newDiagram.id,
            name: `Property ${i + 1}`,
            value: 5.0,
            position: i,
          }));

        const { data: propertiesData, error: propertiesError } = await supabase
          .from("diagram_properties")
          .insert(defaultProperties)
          .select();

        if (propertiesError) throw propertiesError;

        const defaultDiagram: Diagram = {
          id: newDiagram.id,
          name: newDiagram.name,
          thumbnail: newDiagram.thumbnail,
          properties: propertiesData.map((p) => ({
            name: p.name,
            value: p.value,
          })),
        };

        setDiagrams([defaultDiagram]);
        setCurrentDiagramId(defaultDiagram.id);
      } else {
        setDiagrams(loadedDiagrams);
        setCurrentDiagramId(loadedDiagrams[0].id);
      }
    } catch (error) {
      console.error("Error loading diagrams:", error);
    }
  }, [id, supabase, propertyCount]);

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

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
    async (newCount: number) => {
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
                  diagram_id: diagram.id,
                  name: existingName || `Property ${propertyIndex + 1}`,
                  value: 5.0,
                  position: propertyIndex,
                };
              });

            const { error } = await supabase
              .from("diagram_properties")
              .insert(additionalProperties);
            if (error) throw error;

            newProperties = [
              ...newProperties,
              ...additionalProperties.map((p) => ({
                name: p.name,
                value: p.value,
              })),
            ];
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
        if (change.name !== undefined) {
          // If it's a name change, update all diagrams' properties at this position
          const { data: diagrams, error: diagramsError } = await supabase
            .from("diagrams")
            .select("id")
            .eq("tier_list_id", id);

          if (diagramsError) throw diagramsError;
          if (!diagrams || diagrams.length === 0)
            throw new Error("No diagrams found");

          // Update properties for each diagram
          const promises = diagrams.map((d) =>
            supabase
              .from("diagram_properties")
              .update({ name: change.name })
              .eq("diagram_id", d.id)
              .eq("position", index)
          );

          const results = await Promise.all(promises);
          const updateError = results.find((r) => r.error);
          if (updateError) throw updateError.error;

          // Update all diagrams in local state
          setDiagrams((prevDiagrams) =>
            prevDiagrams.map((diagram) => ({
              ...diagram,
              properties: diagram.properties.map((prop, i) =>
                i === index ? { ...prop, name: change.name! } : prop
              ),
            }))
          );
        } else if (change.value !== undefined) {
          // If it's a value change, only update the current diagram
          // First, check if this property already exists
          const { data: existingProps, error: queryError } = await supabase
            .from("diagram_properties")
            .select("id, name")
            .eq("diagram_id", currentDiagram.id)
            .eq("position", index)
            .single();

          if (queryError && queryError.code !== "PGRST116") {
            // PGRST116 is "not found" error
            throw queryError;
          }

          let error;
          if (existingProps) {
            // Update existing property
            ({ error } = await supabase
              .from("diagram_properties")
              .update({ value: change.value })
              .eq("id", existingProps.id));
          } else {
            // Create new property with a unique name
            const propertyName =
              diagrams.find((d) => d.properties[index]?.name)?.properties[index]
                .name ||
              currentDiagram.properties[index]?.name ||
              `Property ${index + 1}`;

            ({ error } = await supabase.from("diagram_properties").insert({
              diagram_id: currentDiagram.id,
              name: propertyName,
              value: change.value,
              position: index,
            }));
          }

          if (error) throw error;

          // Update only current diagram in local state
          setDiagrams((prevDiagrams) => {
            const updatedDiagram = { ...currentDiagram };
            const newProperties = [...updatedDiagram.properties];

            if (index >= newProperties.length) {
              // Use the same property name we used for the upsert
              const propertyName =
                diagrams.find((d) => d.properties[index]?.name)?.properties[
                  index
                ].name ||
                currentDiagram.properties[index]?.name ||
                `Property ${index + 1}`;

              while (newProperties.length <= index) {
                newProperties.push({
                  name: propertyName,
                  value: 5,
                });
              }
            }

            newProperties[index] = {
              ...newProperties[index],
              value: change.value ?? 5, // Provide default value if undefined
            };

            updatedDiagram.properties = newProperties;

            return prevDiagrams.map((diagram) =>
              diagram.id === currentDiagramId ? updatedDiagram : diagram
            );
          });
        }
      } catch (error) {
        console.error("Error updating property:", error);
      }
    },
    [currentDiagram, currentDiagramId, supabase, diagrams, id]
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

      // Insert properties for the new diagram using existing names if available
      const properties = Array(propertyCount)
        .fill(null)
        .map((_, i) => {
          // Look for existing property name at this index across all diagrams
          const existingName = diagrams.find((d) => d.properties[i]?.name)
            ?.properties[i].name;
          return {
            diagram_id: newDiagram.id,
            name: existingName || `Property ${i + 1}`,
            value: 5.0,
            position: i,
          };
        });

      const { data: propertiesData, error: propertiesError } = await supabase
        .from("diagram_properties")
        .insert(properties)
        .select();

      if (propertiesError) throw propertiesError;

      const newDiagramWithProperties: Diagram = {
        id: newDiagram.id,
        name: newDiagram.name,
        thumbnail: newDiagram.thumbnail,
        properties: propertiesData.map((p) => ({
          name: p.name,
          value: p.value,
        })),
      };

      setDiagrams((prevDiagrams) => [
        ...prevDiagrams,
        newDiagramWithProperties,
      ]);
      setCurrentDiagramId(newDiagram.id);
    } catch (error) {
      console.error("Error adding diagram:", error);
    }
  }, [id, propertyCount, supabase, diagrams]);

  const handleDiagramDelete = useCallback(
    async (diagramId: string) => {
      if (!id) return;

      try {
        const { error } = await supabase
          .from("diagrams")
          .delete()
          .eq("id", diagramId);
        if (error) throw error;

        setDiagrams((prevDiagrams) => {
          const filteredDiagrams = prevDiagrams.filter(
            (d) => d.id !== diagramId
          );
          if (currentDiagramId === diagramId) {
            setCurrentDiagramId(
              filteredDiagrams.length > 0 ? filteredDiagrams[0].id : ""
            );
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

        setDiagrams((prevDiagrams) =>
          prevDiagrams.map((d) => (d.id === diagramId ? { ...d, name } : d))
        );
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        tierListName={tierListName}
        onTierListNameChange={handleTierListNameChange}
      />
      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
        {/* Large screens: Three-column layout */}
        <div className="hidden lg:flex flex-1">
          {/* Left column - DiagramList (20%) */}
          <div className="h-full w-1/5">
            <DiagramList
              diagrams={sortedDiagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={setCurrentDiagramId}
              onAddDiagram={handleAddDiagram}
            />
          </div>

          {/* Center column - Main content (60%) */}
          <div className="w-3/5">
            <MainContent
              diagrams={diagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={setCurrentDiagramId}
              onDiagramDelete={handleDiagramDelete}
              onDiagramNameChange={handleDiagramNameChange}
              onPropertyChange={(propertyIndex, newValue) => {
                if (currentDiagram) {
                  handlePropertyChange(propertyIndex, { value: newValue });
                }
              }}
            />
          </div>

          {/* Right column - Sidebar (20%) */}
          <div className="w-1/5">
            <Sidebar
              propertyCount={propertyCount}
              onPropertyCountChange={handlePropertyCountChange}
              currentDiagram={currentDiagram}
              propertyNames={propertyNames}
              onPropertyChange={handlePropertyChange}
              onSortingChange={setSortingConfigs}
              diagrams={diagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={setCurrentDiagramId}
              onAddDiagram={handleAddDiagram}
            />
          </div>
        </div>

        {/* Mobile/tablet layout with tabs */}
        <div className="lg:hidden flex flex-col flex-1">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed right-1 top-16 z-50"
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[450px] p-0">
              <Sidebar
                propertyCount={propertyCount}
                onPropertyCountChange={handlePropertyCountChange}
                currentDiagram={currentDiagram}
                propertyNames={propertyNames}
                onPropertyChange={handlePropertyChange}
                onSortingChange={setSortingConfigs}
                diagrams={diagrams}
                currentDiagramId={currentDiagramId}
                onDiagramSelect={setCurrentDiagramId}
                onAddDiagram={handleAddDiagram}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <MainContent
              diagrams={diagrams}
              currentDiagramId={currentDiagramId}
              onDiagramSelect={setCurrentDiagramId}
              onDiagramDelete={handleDiagramDelete}
              onDiagramNameChange={handleDiagramNameChange}
              onPropertyChange={(propertyIndex, newValue) => {
                if (currentDiagram) {
                  handlePropertyChange(propertyIndex, { value: newValue });
                }
              }}
              showDiagramList={true}
              sortedDiagrams={sortedDiagrams}
              onAddDiagram={handleAddDiagram}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
