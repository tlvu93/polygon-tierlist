import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { TierListSettingsStore, DEFAULT_SETTINGS } from "./types";
import {
  createCustomStorage,
  getStorageAdapter,
} from "./adapters/storageAdapter";

// Create the settings store with persistence
export const useTierListSettingsStore = create<TierListSettingsStore>()(
  persist(
    immer((set) => ({
      // Initial state
      ...DEFAULT_SETTINGS,

      // Settings actions
      setDefaultStatCount: (count) =>
        set((state) => {
          state.defaultStatCount = Math.min(Math.max(count, 3), 8);
        }),

      setDefaultSidebarWidth: (width) =>
        set((state) => {
          state.defaultSidebarWidth = Math.min(Math.max(width, 160), 400);
        }),

      setAutoSave: (autoSave) =>
        set((state) => {
          state.autoSave = autoSave;
        }),

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      setChartDefaults: (defaults) =>
        set((state) => {
          state.chartDefaults = { ...state.chartDefaults, ...defaults };
        }),

      resetSettings: () =>
        set(() => ({
          ...DEFAULT_SETTINGS,
        })),
    })),
    {
      name: "tier-list-settings",
      storage: createCustomStorage(getStorageAdapter(false)), // Start with localStorage
      // Persist all settings
      partialize: (state) => ({
        defaultStatCount: state.defaultStatCount,
        defaultSidebarWidth: state.defaultSidebarWidth,
        autoSave: state.autoSave,
        theme: state.theme,
        chartDefaults: state.chartDefaults,
      }),
    }
  )
);

// Helper hooks for specific settings
export const useDefaultStatCount = () => {
  return useTierListSettingsStore((state) => state.defaultStatCount);
};

export const useDefaultSidebarWidth = () => {
  return useTierListSettingsStore((state) => state.defaultSidebarWidth);
};

export const useAutoSave = () => {
  return useTierListSettingsStore((state) => state.autoSave);
};

export const useTheme = () => {
  return useTierListSettingsStore((state) => state.theme);
};

export const useChartDefaults = () => {
  return useTierListSettingsStore((state) => state.chartDefaults);
};

// Compound hooks for convenience
export const useAllSettings = () => {
  return useTierListSettingsStore((state) => ({
    defaultStatCount: state.defaultStatCount,
    defaultSidebarWidth: state.defaultSidebarWidth,
    autoSave: state.autoSave,
    theme: state.theme,
    chartDefaults: state.chartDefaults,
  }));
};

export const useSettingsActions = () => {
  return useTierListSettingsStore((state) => ({
    setDefaultStatCount: state.setDefaultStatCount,
    setDefaultSidebarWidth: state.setDefaultSidebarWidth,
    setAutoSave: state.setAutoSave,
    setTheme: state.setTheme,
    setChartDefaults: state.setChartDefaults,
    resetSettings: state.resetSettings,
  }));
};
