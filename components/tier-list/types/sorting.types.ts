export interface SortingConfig {
  stat: number;
  weight: number;
}

export interface SortingState {
  configs: SortingConfig[];
  isActive: boolean;
}

export interface SortingOptions {
  direction: "asc" | "desc";
  normalize: boolean;
}
