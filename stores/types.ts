import { PolyList, PolyListStat } from "@/components/tier-list/types";

// Re-export existing types for convenience
export type { PolyList, PolyListStat };

// Sorting configuration
export interface SortingConfig {
  stat: number;
  weight: number;
}

// Sidebar state
export interface SidebarState {
  collapsed: boolean;
  width: number;
}

// UI preferences
export interface UIPreferences {
  leftSidebar: SidebarState;
  rightSidebar: SidebarState;
  isDraggable: boolean;
  selectedStatIndex: number | null;
  isSheetOpen: boolean; // For mobile
}

// Data store - persistent tier list data
export interface TierListDataState {
  polyLists: PolyList[];
  currentPolyListId: string;
  statCount: number;
  sortingConfigs: SortingConfig[];
  tierListName: string;
  lastModified: string;
  _hasHydrated?: boolean; // Internal hydration state
}

// Data store actions
export interface TierListDataActions {
  // PolyList operations
  setPolyLists: (polyLists: PolyList[]) => void;
  addPolyList: (polyList: PolyList) => void;
  updatePolyList: (id: string, updates: Partial<PolyList>) => void;
  deletePolyList: (id: string) => void;
  setCurrentPolyListId: (id: string) => void;

  // Stat operations
  setStatCount: (count: number) => void;
  updateStat: (
    polyListId: string,
    statIndex: number,
    updates: Partial<PolyListStat>
  ) => void;

  // Sorting operations
  setSortingConfigs: (configs: SortingConfig[]) => void;
  addSortingConfig: (config: SortingConfig) => void;
  updateSortingConfig: (index: number, config: Partial<SortingConfig>) => void;
  removeSortingConfig: (index: number) => void;

  // Tier list operations
  setTierListName: (name: string) => void;

  // Data management
  loadFromStorage: (id: string) => Promise<void>;
  saveToStorage: (id: string) => Promise<void>;
  resetData: () => void;
}

// UI store - non-persistent UI state
export interface TierListUIState {
  preferences: UIPreferences;
  dragState: {
    isDragging: boolean;
    dragIndex: number | null;
  };
  chartSettings: {
    hideLabels: boolean;
    isPreview: boolean;
  };
}

// UI store actions
export interface TierListUIActions {
  // Sidebar operations
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarWidth: (width: number) => void;
  setRightSidebarWidth: (width: number) => void;

  // Interaction state
  setIsDraggable: (isDraggable: boolean) => void;
  setSelectedStatIndex: (index: number | null) => void;
  setIsSheetOpen: (isOpen: boolean) => void;

  // Drag state
  setDragState: (isDragging: boolean, dragIndex: number | null) => void;

  // Chart settings
  setHideLabels: (hideLabels: boolean) => void;
  setIsPreview: (isPreview: boolean) => void;

  // Reset UI state
  resetUI: () => void;
}

// Settings store - persistent user preferences
export interface TierListSettingsState {
  defaultStatCount: number;
  defaultSidebarWidth: number;
  autoSave: boolean;
  theme: "light" | "dark" | "system";
  chartDefaults: {
    hideLabels: boolean;
    isDraggable: boolean;
  };
}

// Settings store actions
export interface TierListSettingsActions {
  setDefaultStatCount: (count: number) => void;
  setDefaultSidebarWidth: (width: number) => void;
  setAutoSave: (autoSave: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setChartDefaults: (
    defaults: Partial<TierListSettingsState["chartDefaults"]>
  ) => void;
  resetSettings: () => void;
}

// Combined store types
export type TierListDataStore = TierListDataState & TierListDataActions;
export type TierListUIStore = TierListUIState & TierListUIActions;
export type TierListSettingsStore = TierListSettingsState &
  TierListSettingsActions;

// Store selectors - for optimized component subscriptions
export interface TierListDataSelectors {
  currentPolyList: (state: TierListDataStore) => PolyList | undefined;
  sortedPolyLists: (state: TierListDataStore) => PolyList[];
  statNames: (state: TierListDataStore) => string[];
  hasUnsavedChanges: (state: TierListDataStore) => boolean;
}

export interface TierListUISelectors {
  isSidebarCollapsed: (
    side: "left" | "right"
  ) => (state: TierListUIStore) => boolean;
  sidebarWidth: (side: "left" | "right") => (state: TierListUIStore) => number;
  canDrag: (state: TierListUIStore) => boolean;
}

// Default values
export const DEFAULT_SIDEBAR_STATE: SidebarState = {
  collapsed: false,
  width: 256,
};

export const DEFAULT_UI_PREFERENCES: UIPreferences = {
  leftSidebar: DEFAULT_SIDEBAR_STATE,
  rightSidebar: DEFAULT_SIDEBAR_STATE,
  isDraggable: true,
  selectedStatIndex: null,
  isSheetOpen: false,
};

export const DEFAULT_TIER_LIST_DATA: TierListDataState = {
  polyLists: [],
  currentPolyListId: "",
  statCount: 5,
  sortingConfigs: [],
  tierListName: "Headphone Comparison",
  lastModified: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: TierListSettingsState = {
  defaultStatCount: 5,
  defaultSidebarWidth: 256,
  autoSave: true,
  theme: "system",
  chartDefaults: {
    hideLabels: false,
    isDraggable: true,
  },
};
