import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useMemo } from "react";
import {
  TierListDataStore,
  TierListDataSelectors,
  DEFAULT_TIER_LIST_DATA,
  PolyList,
  SortingConfig,
} from "./types";
import {
  createCustomStorage,
  getStorageAdapter,
} from "./adapters/storageAdapter";

// Create the store with persistence
export const useTierListDataStore = create<TierListDataStore>()(
  persist(
    immer((set) => ({
      // Initial state
      ...DEFAULT_TIER_LIST_DATA,
      _hasHydrated: false,

      // PolyList operations
      setPolyLists: (polyLists) =>
        set((state) => {
          state.polyLists = polyLists;
          state.lastModified = new Date().toISOString();
        }),

      addPolyList: (polyList) =>
        set((state) => {
          state.polyLists.push(polyList);
          state.lastModified = new Date().toISOString();
        }),

      updatePolyList: (id, updates) =>
        set((state) => {
          const index = state.polyLists.findIndex((p: PolyList) => p.id === id);
          if (index !== -1) {
            state.polyLists[index] = { ...state.polyLists[index], ...updates };
            state.lastModified = new Date().toISOString();
          }
        }),

      deletePolyList: (id) =>
        set((state) => {
          state.polyLists = state.polyLists.filter(
            (p: PolyList) => p.id !== id
          );
          // Update current selection if deleted
          if (state.currentPolyListId === id) {
            state.currentPolyListId = state.polyLists[0]?.id || "";
          }
          state.lastModified = new Date().toISOString();
        }),

      setCurrentPolyListId: (id) =>
        set((state) => {
          state.currentPolyListId = id;
        }),

      // Stat operations
      setStatCount: (count) =>
        set((state) => {
          const clampedCount = Math.min(Math.max(count, 3), 8);
          state.statCount = clampedCount;

          // Update all polyLists to match new stat count
          state.polyLists.forEach((polyList: PolyList) => {
            if (polyList.stats.length < clampedCount) {
              // Add new stats
              const additionalStats = Array(
                clampedCount - polyList.stats.length
              )
                .fill(null)
                .map((_, i) => ({
                  name: `Stat ${polyList.stats.length + i + 1}`,
                  value: 5.0,
                }));
              polyList.stats.push(...additionalStats);
            } else if (polyList.stats.length > clampedCount) {
              // Remove excess stats
              polyList.stats = polyList.stats.slice(0, clampedCount);
            }
          });

          state.lastModified = new Date().toISOString();
        }),

      updateStat: (polyListId, statIndex, updates) =>
        set((state) => {
          const polyList = state.polyLists.find(
            (p: PolyList) => p.id === polyListId
          );
          if (polyList && polyList.stats[statIndex]) {
            polyList.stats[statIndex] = {
              ...polyList.stats[statIndex],
              ...updates,
            };
            state.lastModified = new Date().toISOString();
          }
        }),

      // Sorting operations
      setSortingConfigs: (configs) =>
        set((state) => {
          state.sortingConfigs = configs;
          state.lastModified = new Date().toISOString();
        }),

      addSortingConfig: (config) =>
        set((state) => {
          state.sortingConfigs.push(config);
          state.lastModified = new Date().toISOString();
        }),

      updateSortingConfig: (index, config) =>
        set((state) => {
          if (state.sortingConfigs[index]) {
            state.sortingConfigs[index] = {
              ...state.sortingConfigs[index],
              ...config,
            };
            state.lastModified = new Date().toISOString();
          }
        }),

      removeSortingConfig: (index) =>
        set((state) => {
          state.sortingConfigs.splice(index, 1);
          state.lastModified = new Date().toISOString();
        }),

      // Tier list operations
      setTierListName: (name) =>
        set((state) => {
          state.tierListName = name;
          state.lastModified = new Date().toISOString();
        }),

      // Data management
      loadFromStorage: async (id) => {
        // This will be called manually when needed
        // The persist middleware handles automatic loading
        console.log("Loading tier list data for:", id);
      },

      saveToStorage: async (id) => {
        // This will be called manually when needed
        // The persist middleware handles automatic saving
        console.log("Saving tier list data for:", id);
      },

      resetData: () =>
        set(() => ({
          ...DEFAULT_TIER_LIST_DATA,
          lastModified: new Date().toISOString(),
        })),
    })),
    {
      name: "tier-list-data",
      storage: createCustomStorage(getStorageAdapter(false)), // Start with localStorage
      partialize: (state) => ({
        polyLists: state.polyLists,
        currentPolyListId: state.currentPolyListId,
        statCount: state.statCount,
        sortingConfigs: state.sortingConfigs,
        tierListName: state.tierListName,
        lastModified: state.lastModified,
      }),
      onRehydrateStorage: () => (state) => {
        // This runs after hydration from storage
        if (state) {
          state._hasHydrated = true;
          // Ensure we have at least one polyList
          if (state.polyLists.length === 0) {
            const defaultPolyList = {
              id: `diagram-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: "Poly List 1",
              thumbnail: "/placeholder.svg",
              stats: Array(state.statCount || 5)
                .fill(null)
                .map((_, i) => ({
                  name: `Stat ${i + 1}`,
                  value: 5.0,
                })),
            };
            state.polyLists = [defaultPolyList];
            state.currentPolyListId = defaultPolyList.id;
          }
        }
      },
    }
  )
);

// Selectors - optimized state access
export const tierListDataSelectors: TierListDataSelectors = {
  currentPolyList: (state) =>
    state.polyLists.find((p: PolyList) => p.id === state.currentPolyListId),

  sortedPolyLists: (state) => {
    if (state.sortingConfigs.length === 0) return state.polyLists;

    return [...state.polyLists].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const totalWeight = state.sortingConfigs.reduce(
        (sum, config) => sum + config.weight,
        0
      );
      const normalizer = totalWeight === 0 ? 1 : totalWeight;

      state.sortingConfigs.forEach((config) => {
        const propA = a.stats[config.stat]?.value || 0;
        const propB = b.stats[config.stat]?.value || 0;
        const normalizedWeight = config.weight / normalizer;

        scoreA += propA * normalizedWeight;
        scoreB += propB * normalizedWeight;
      });

      return scoreB - scoreA; // Descending order
    });
  },

  statNames: (state) => {
    const currentPolyList = state.polyLists.find(
      (p: PolyList) => p.id === state.currentPolyListId
    );
    return Array(state.statCount)
      .fill(null)
      .map((_, i) => currentPolyList?.stats[i]?.name || `Stat ${i + 1}`);
  },

  hasUnsavedChanges: (state) => {
    // This could be enhanced to track actual changes
    const now = new Date().getTime();
    const lastModified = new Date(state.lastModified).getTime();
    return now - lastModified < 5000; // Within last 5 seconds
  },
};

// Utility functions for creating new entities
export const createPolyList = (name: string, statCount: number): PolyList => ({
  id: `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name,
  thumbnail: "/placeholder.svg",
  stats: Array(statCount)
    .fill(null)
    .map((_, i) => ({
      name: `Stat ${i + 1}`,
      value: 5.0,
    })),
});

export const createSortingConfig = (
  stat: number,
  weight: number
): SortingConfig => ({
  stat,
  weight,
});

// Helper hooks for specific use cases
export const useCurrentPolyList = () => {
  return useTierListDataStore((state) =>
    state.polyLists.find((p: PolyList) => p.id === state.currentPolyListId)
  );
};

export const useSortedPolyLists = () => {
  const polyLists = useTierListDataStore((state) => state.polyLists);
  const sortingConfigs = useTierListDataStore((state) => state.sortingConfigs);

  return useMemo(() => {
    if (sortingConfigs.length === 0) return polyLists;

    const sorted = polyLists.slice().sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const totalWeight = sortingConfigs.reduce(
        (sum, config) => sum + config.weight,
        0
      );
      const normalizer = totalWeight === 0 ? 1 : totalWeight;

      sortingConfigs.forEach((config) => {
        const propA = a.stats[config.stat]?.value || 0;
        const propB = b.stats[config.stat]?.value || 0;
        const normalizedWeight = config.weight / normalizer;

        scoreA += propA * normalizedWeight;
        scoreB += propB * normalizedWeight;
      });

      return scoreB - scoreA; // Descending order
    });
    return sorted;
  }, [polyLists, sortingConfigs]);
};

export const useStatNames = () => {
  const currentPolyListId = useTierListDataStore(
    (state) => state.currentPolyListId
  );
  const statCount = useTierListDataStore((state) => state.statCount);
  const polyLists = useTierListDataStore((state) => state.polyLists);

  return useMemo(() => {
    const currentPolyList = polyLists.find(
      (p: PolyList) => p.id === currentPolyListId
    );
    const statNames = new Array(statCount);
    for (let i = 0; i < statCount; i++) {
      statNames[i] = currentPolyList?.stats[i]?.name || `Stat ${i + 1}`;
    }
    return statNames;
  }, [currentPolyListId, statCount, polyLists]);
};

export const useHasUnsavedChanges = () => {
  const lastModified = useTierListDataStore((state) => state.lastModified);

  return useMemo(() => {
    // This could be enhanced to track actual changes
    const lastModifiedTime = new Date(lastModified).getTime();
    const now = Date.now();
    return now - lastModifiedTime < 5000; // Within last 5 seconds
  }, [lastModified]);
};

export const useHasHydrated = () => {
  return useTierListDataStore((state) => state._hasHydrated);
};
