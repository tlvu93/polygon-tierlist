import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  TierListUIStore,
  TierListUISelectors,
  DEFAULT_UI_PREFERENCES,
} from "./types";

// Create the UI store - no persistence needed
export const useTierListUIStore = create<TierListUIStore>()(
  immer((set) => ({
    // Initial state
    preferences: DEFAULT_UI_PREFERENCES,
    dragState: {
      isDragging: false,
      dragIndex: null,
    },
    chartSettings: {
      hideLabels: false,
      isPreview: false,
    },

    // Sidebar operations
    toggleLeftSidebar: () =>
      set((state) => {
        state.preferences.leftSidebar.collapsed =
          !state.preferences.leftSidebar.collapsed;
      }),

    toggleRightSidebar: () =>
      set((state) => {
        state.preferences.rightSidebar.collapsed =
          !state.preferences.rightSidebar.collapsed;
      }),

    setLeftSidebarWidth: (width) =>
      set((state) => {
        const clampedWidth = Math.min(Math.max(width, 160), 400);
        state.preferences.leftSidebar.width = clampedWidth;
      }),

    setRightSidebarWidth: (width) =>
      set((state) => {
        const clampedWidth = Math.min(Math.max(width, 160), 400);
        state.preferences.rightSidebar.width = clampedWidth;
      }),

    // Interaction state
    setIsDraggable: (isDraggable) =>
      set((state) => {
        state.preferences.isDraggable = isDraggable;
      }),

    setSelectedStatIndex: (index) =>
      set((state) => {
        state.preferences.selectedStatIndex = index;
      }),

    setIsSheetOpen: (isOpen) =>
      set((state) => {
        state.preferences.isSheetOpen = isOpen;
      }),

    // Drag state
    setDragState: (isDragging, dragIndex) =>
      set((state) => {
        state.dragState.isDragging = isDragging;
        state.dragState.dragIndex = dragIndex;
      }),

    // Chart settings
    setHideLabels: (hideLabels) =>
      set((state) => {
        state.chartSettings.hideLabels = hideLabels;
      }),

    setIsPreview: (isPreview) =>
      set((state) => {
        state.chartSettings.isPreview = isPreview;
      }),

    // Reset UI state
    resetUI: () =>
      set(() => ({
        preferences: DEFAULT_UI_PREFERENCES,
        dragState: {
          isDragging: false,
          dragIndex: null,
        },
        chartSettings: {
          hideLabels: false,
          isPreview: false,
        },
      })),
  }))
);

// Selectors for optimized access
export const tierListUISelectors: TierListUISelectors = {
  isSidebarCollapsed: (side) => (state) =>
    side === "left"
      ? state.preferences.leftSidebar.collapsed
      : state.preferences.rightSidebar.collapsed,

  sidebarWidth: (side) => (state) =>
    side === "left"
      ? state.preferences.leftSidebar.width
      : state.preferences.rightSidebar.width,

  canDrag: (state) =>
    state.preferences.isDraggable && !state.dragState.isDragging,
};

// Helper hooks for specific UI needs
export const useLeftSidebarState = () => {
  return useTierListUIStore((state) => state.preferences.leftSidebar);
};

export const useRightSidebarState = () => {
  return useTierListUIStore((state) => state.preferences.rightSidebar);
};

export const useIsDraggable = () => {
  return useTierListUIStore((state) => state.preferences.isDraggable);
};

export const useSelectedStatIndex = () => {
  return useTierListUIStore((state) => state.preferences.selectedStatIndex);
};

export const useDragState = () => {
  return useTierListUIStore((state) => state.dragState);
};

export const useChartSettings = () => {
  return useTierListUIStore((state) => state.chartSettings);
};

export const useIsSheetOpen = () => {
  return useTierListUIStore((state) => state.preferences.isSheetOpen);
};

// Compound selectors for complex UI logic
export const useCanDrag = () => {
  return useTierListUIStore(tierListUISelectors.canDrag);
};

export const useIsLeftSidebarCollapsed = () => {
  return useTierListUIStore(tierListUISelectors.isSidebarCollapsed("left"));
};

export const useIsRightSidebarCollapsed = () => {
  return useTierListUIStore(tierListUISelectors.isSidebarCollapsed("right"));
};

export const useLeftSidebarWidth = () => {
  return useTierListUIStore(tierListUISelectors.sidebarWidth("left"));
};

export const useRightSidebarWidth = () => {
  return useTierListUIStore(tierListUISelectors.sidebarWidth("right"));
};
