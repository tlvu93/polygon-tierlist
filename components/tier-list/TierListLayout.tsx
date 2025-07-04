"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/app/components/Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";
import PolyListList from "./PolyListList";
import { createClient } from "@/utils/supabase/client";
import { PolyList, PolyListStat } from "./types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortingConfig {
  stat: number;
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
  const [statCount, setStatCount] = useState(5);
  const [currentPolyListId, setCurrentPolyListId] = useState("");
  const [polyLists, setPolyLists] = useState<PolyList[]>([]);
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Load polyLists and stats
  const loadPolyLists = useCallback(async () => {
    if (!id) return;

    try {
      const { data: polyListsData, error: polyListsError } = await supabase
        .from("poly_lists")
        .select("id, name, thumbnail, position")
        .eq("tier_list_id", id)
        .order("position");

      if (polyListsError) throw polyListsError;

      const loadedPolyLists: PolyList[] = [];

      for (const polyList of polyListsData || []) {
        const { data: statsData, error: statsError } = await supabase
          .from("poly_list_stats")
          .select("name, value")
          .eq("poly_list_id", polyList.id)
          .order("position");

        if (statsError) throw statsError;

        loadedPolyLists.push({
          id: polyList.id,
          name: polyList.name,
          thumbnail: polyList.thumbnail,
          stats: statsData || [],
        });
      }

      if (loadedPolyLists.length === 0) {
        // Create a default polyList if none exist
        const { data: newPolyList, error: polyListError } = await supabase
          .from("poly_lists")
          .insert({
            tier_list_id: id,
            name: "Poly List 1",
            position: 0,
          })
          .select()
          .single();

        if (polyListError) throw polyListError;

        // Insert default stats for the new polyList
        const defaultstats = Array(statCount)
          .fill(null)
          .map((_, i) => ({
            poly_list_id: newPolyList.id,
            name: `Stat ${i + 1}`,
            value: 5.0,
            position: i,
          }));

        const { data: statsData, error: statsError } = await supabase
          .from("poly_list_stats")
          .insert(defaultstats)
          .select();

        if (statsError) throw statsError;

        const defaultPolyList: PolyList = {
          id: newPolyList.id,
          name: newPolyList.name,
          thumbnail: newPolyList.thumbnail,
          stats: statsData.map((p) => ({
            name: p.name,
            value: p.value,
          })),
        };

        setPolyLists([defaultPolyList]);
        setCurrentPolyListId(defaultPolyList.id);
      } else {
        setPolyLists(loadedPolyLists);
        setCurrentPolyListId(loadedPolyLists[0].id);
      }
    } catch (error) {
      console.error("Error loading polyLists:", error);
    }
  }, [id, supabase, statCount]);

  useEffect(() => {
    loadPolyLists();
  }, [loadPolyLists]);

  const currentPolyList = useMemo(
    () => polyLists.find((d) => d.id === currentPolyListId),
    [polyLists, currentPolyListId]
  );

  const sortedPolyLists = useMemo(() => {
    if (sortingConfigs.length === 0) return polyLists;

    return [...polyLists].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const totalWeight = sortingConfigs.reduce(
        (sum, config) => sum + config.weight,
        0
      );

      // Normalize weights if total is not 1
      const normalizer = totalWeight === 0 ? 1 : totalWeight;

      sortingConfigs.forEach((config) => {
        const propA = a.stats[config.stat]?.value || 0;
        const propB = b.stats[config.stat]?.value || 0;
        const normalizedWeight = config.weight / normalizer;

        scoreA += propA * normalizedWeight;
        scoreB += propB * normalizedWeight;
      });

      return scoreB - scoreA; // Sort in descending order (highest score first)
    });
  }, [polyLists, sortingConfigs]);

  // Pre-compute stat names for the current polyList
  const statNames = useMemo(() => {
    return Array(statCount)
      .fill(null)
      .map((_, i) => currentPolyList?.stats[i]?.name || `stat ${i + 1}`);
  }, [statCount, currentPolyList]);

  // Handle stat count changes
  const handlestatCountChange = useCallback(
    async (newCount: number) => {
      if (!id) return;

      try {
        const updatedPolyLists = [...polyLists];

        for (let i = 0; i < updatedPolyLists.length; i++) {
          const polyList = updatedPolyLists[i];
          let newstats = [...polyList.stats];

          if (newstats.length < newCount) {
            // Add new stats with consistent names
            const additionalstats = Array(newCount - newstats.length)
              .fill(null)
              .map((_, i) => {
                const statIndex = newstats.length + i;
                // Look for existing stat name at this index across all polyLists
                const existingName = polyLists.find(
                  (d) => d.stats[statIndex]?.name
                )?.stats[statIndex].name;
                return {
                  poly_list_id: polyList.id,
                  name: existingName || `stat ${statIndex + 1}`,
                  value: 5.0,
                  position: statIndex,
                };
              });

            const { error } = await supabase
              .from("poly_list_stats")
              .insert(additionalstats);
            if (error) throw error;

            newstats = [
              ...newstats,
              ...additionalstats.map((p) => ({
                name: p.name,
                value: p.value,
              })),
            ];
          } else if (newstats.length > newCount) {
            // Remove excess stats
            const { error } = await supabase
              .from("poly_list_stats")
              .delete()
              .eq("poly_list_id", polyList.id)
              .gte("position", newCount);

            if (error) throw error;
            newstats = newstats.slice(0, newCount);
          }

          updatedPolyLists[i] = { ...polyList, stats: newstats };
        }

        setPolyLists(updatedPolyLists);
        setStatCount(newCount);
      } catch (error) {
        console.error("Error updating stats:", error);
      }
    },
    [polyLists, id, supabase]
  );

  const handlestatChange = useCallback(
    async (index: number, change: Partial<PolyListStat>) => {
      if (!currentPolyList) return;

      try {
        if (change.name !== undefined) {
          // If it's a name change, update all polyLists' stats at this position
          const { data: polyLists, error: polyListsError } = await supabase
            .from("poly_lists")
            .select("id")
            .eq("tier_list_id", id);

          if (polyListsError) throw polyListsError;
          if (!polyLists || polyLists.length === 0)
            throw new Error("No polyLists found");

          // Update stats for each polyList
          const promises = polyLists.map((d) =>
            supabase
              .from("poly_list_stats")
              .update({ name: change.name })
              .eq("poly_list_id", d.id)
              .eq("position", index)
          );

          const results = await Promise.all(promises);
          const updateError = results.find((r) => r.error);
          if (updateError) throw updateError.error;

          // Update all polyLists in local state
          setPolyLists((prevPolyLists) =>
            prevPolyLists.map((polyList) => ({
              ...polyList,
              stats: polyList.stats.map((prop, i) =>
                i === index ? { ...prop, name: change.name! } : prop
              ),
            }))
          );
        } else if (change.value !== undefined) {
          // If it's a value change, only update the current polyList
          // First, check if this stat already exists
          const { data: existingProps, error: queryError } = await supabase
            .from("poly_list_stats")
            .select("id, name")
            .eq("poly_list_id", currentPolyList.id)
            .eq("position", index)
            .single();

          if (queryError && queryError.code !== "PGRST116") {
            // PGRST116 is "not found" error
            throw queryError;
          }

          let error;
          if (existingProps) {
            // Update existing stat
            ({ error } = await supabase
              .from("poly_list_stats")
              .update({ value: change.value })
              .eq("id", existingProps.id));
          } else {
            // Create new stat with a unique name
            const statName =
              polyLists.find((d) => d.stats[index]?.name)?.stats[index].name ||
              currentPolyList.stats[index]?.name ||
              `stat ${index + 1}`;

            ({ error } = await supabase.from("poly_list_stats").insert({
              poly_list_id: currentPolyList.id,
              name: statName,
              value: change.value,
              position: index,
            }));
          }

          if (error) throw error;

          // Update only current polyList in local state
          setPolyLists((prevPolyLists) => {
            const updatedPolyList = { ...currentPolyList };
            const newstats = [...updatedPolyList.stats];

            if (index >= newstats.length) {
              // Use the same stat name we used for the upsert
              const statName =
                polyLists.find((d) => d.stats[index]?.name)?.stats[index]
                  .name ||
                currentPolyList.stats[index]?.name ||
                `stat ${index + 1}`;

              while (newstats.length <= index) {
                newstats.push({
                  name: statName,
                  value: 5,
                });
              }
            }

            newstats[index] = {
              ...newstats[index],
              value: change.value ?? 5, // Provide default value if undefined
            };

            updatedPolyList.stats = newstats;

            return prevPolyLists.map((polyList) =>
              polyList.id === currentPolyListId ? updatedPolyList : polyList
            );
          });
        }
      } catch (error) {
        console.error("Error updating stat:", error);
      }
    },
    [currentPolyList, currentPolyListId, supabase, polyLists, id]
  );

  const handleAddPolyList = useCallback(async () => {
    if (!id) return;

    try {
      // Insert new polyList
      const { data: newPolyList, error: polyListError } = await supabase
        .from("poly_lists")
        .insert({
          tier_list_id: id,
          name: `Poly List ${polyLists.length + 1}`,
          position: polyLists.length,
        })
        .select()
        .single();

      if (polyListError) throw polyListError;

      // Insert stats for the new polyList using existing names if available
      const stats = Array(statCount)
        .fill(null)
        .map((_, i) => {
          // Look for existing stat name at this index across all polyLists
          const existingName = polyLists.find((d) => d.stats[i]?.name)?.stats[i]
            .name;
          return {
            poly_list_id: newPolyList.id,
            name: existingName || `stat ${i + 1}`,
            value: 5.0,
            position: i,
          };
        });

      const { data: statsData, error: statsError } = await supabase
        .from("poly_list_stats")
        .insert(stats)
        .select();

      if (statsError) throw statsError;

      const newPolyListWithstats: PolyList = {
        id: newPolyList.id,
        name: newPolyList.name,
        thumbnail: newPolyList.thumbnail,
        stats: statsData.map((p) => ({
          name: p.name,
          value: p.value,
        })),
      };

      setPolyLists((prevPolyLists) => [...prevPolyLists, newPolyListWithstats]);
      setCurrentPolyListId(newPolyList.id);
    } catch (error) {
      console.error("Error adding polyList:", error);
    }
  }, [id, statCount, supabase, polyLists]);

  const handlePolyListDelete = useCallback(
    async (polyListId: string) => {
      if (!id) return;

      try {
        const { error } = await supabase
          .from("poly_lists")
          .delete()
          .eq("id", polyListId);
        if (error) throw error;

        setPolyLists((prevPolyLists) => {
          const filteredPolyLists = prevPolyLists.filter(
            (d) => d.id !== polyListId
          );
          if (currentPolyListId === polyListId) {
            setCurrentPolyListId(
              filteredPolyLists.length > 0 ? filteredPolyLists[0].id : ""
            );
          }
          return filteredPolyLists;
        });
      } catch (error) {
        console.error("Error deleting polyList:", error);
      }
    },
    [id, currentPolyListId, supabase]
  );

  const handlePolyListNameChange = useCallback(
    async (polyListId: string, name: string) => {
      if (!id) return;

      try {
        const { error } = await supabase
          .from("poly_lists")
          .update({ name, updated_at: new Date().toISOString() })
          .eq("id", polyListId);

        if (error) throw error;

        setPolyLists((prevPolyLists) =>
          prevPolyLists.map((d) => (d.id === polyListId ? { ...d, name } : d))
        );
      } catch (error) {
        console.error("Error updating polyList name:", error);
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
          {/* Left column - PolyListList (20%) */}
          <div className="h-full w-1/5">
            <PolyListList
              polyLists={sortedPolyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={setCurrentPolyListId}
              onAddPolyList={handleAddPolyList}
            />
          </div>

          {/* Center column - Main content (60%) */}
          <div className="w-3/5">
            <MainContent
              polyLists={polyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={setCurrentPolyListId}
              onPolyListDelete={handlePolyListDelete}
              onPolyListNameChange={handlePolyListNameChange}
              onStatChange={(statIndex, newValue) => {
                if (currentPolyList) {
                  handlestatChange(statIndex, { value: newValue });
                }
              }}
            />
          </div>

          {/* Right column - Sidebar (20%) */}
          <div className="w-1/5">
            <Sidebar
              statCount={statCount}
              onStatCountChange={handlestatCountChange}
              currentPolyList={currentPolyList}
              statNames={statNames}
              onStatChange={handlestatChange}
              onSortingChange={setSortingConfigs}
              polyLists={polyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={setCurrentPolyListId}
              onAddPolyList={handleAddPolyList}
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
                statCount={statCount}
                onStatCountChange={handlestatCountChange}
                currentPolyList={currentPolyList}
                statNames={statNames}
                onStatChange={handlestatChange}
                onSortingChange={setSortingConfigs}
                polyLists={polyLists}
                currentPolyListId={currentPolyListId}
                onPolyListSelect={setCurrentPolyListId}
                onAddPolyList={handleAddPolyList}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <MainContent
              polyLists={polyLists}
              currentPolyListId={currentPolyListId}
              onPolyListSelect={setCurrentPolyListId}
              onPolyListDelete={handlePolyListDelete}
              onPolyListNameChange={handlePolyListNameChange}
              onStatChange={(statIndex, newValue) => {
                if (currentPolyList) {
                  handlestatChange(statIndex, { value: newValue });
                }
              }}
              showPolyListList={true}
              sortedPolyLists={sortedPolyLists}
              onAddPolyList={handleAddPolyList}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
