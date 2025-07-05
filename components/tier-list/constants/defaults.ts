import { SortingConfig } from "../types/sorting.types";

export const DEFAULT_STAT_COUNT = 5;
export const MIN_STAT_COUNT = 3;
export const MAX_STAT_COUNT = 8;

export const DEFAULT_STAT_VALUE = 5.0;
export const MIN_STAT_VALUE = 0;
export const MAX_STAT_VALUE = 10;
export const STAT_STEP = 0.1;

export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 160;
export const MAX_SIDEBAR_WIDTH = 400;

export const DEBOUNCE_DELAYS = {
  STAT_NAME: 1000,
  STAT_VALUE: 150,
  SORTING: 150,
} as const;

export const DEFAULT_SORTING_CONFIG: SortingConfig = {
  stat: 0,
  weight: 1,
};

export const DEFAULT_TIER_LIST_NAME = "Headphone Comparison";

export const EXPORT_FILENAMES = {
  PNG: "tier-list.png",
  CSV: "polygon-tier-list.csv",
} as const;
