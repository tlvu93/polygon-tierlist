import { PolyList } from "../types";
import { SortingConfig, SortingOptions } from "../types/sorting.types";

export const calculateSortedPolyLists = (
  polyLists: PolyList[],
  sortingConfigs: SortingConfig[],
  options: SortingOptions = { direction: "desc", normalize: true }
): PolyList[] => {
  if (sortingConfigs.length === 0) return polyLists;

  return [...polyLists].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    const totalWeight = sortingConfigs.reduce(
      (sum, config) => sum + config.weight,
      0
    );

    // Normalize weights if total is not 1
    const normalizer = options.normalize && totalWeight !== 0 ? totalWeight : 1;

    sortingConfigs.forEach((config) => {
      const propA = a.stats[config.stat]?.value || 0;
      const propB = b.stats[config.stat]?.value || 0;
      const normalizedWeight = config.weight / normalizer;

      scoreA += propA * normalizedWeight;
      scoreB += propB * normalizedWeight;
    });

    return options.direction === "desc" ? scoreB - scoreA : scoreA - scoreB;
  });
};

export const validateSortingConfig = (
  config: SortingConfig,
  statCount: number
): { isValid: boolean; error?: string } => {
  if (config.stat < 0 || config.stat >= statCount) {
    return { isValid: false, error: "Invalid stat index" };
  }

  if (config.weight < 0 || config.weight > 1) {
    return { isValid: false, error: "Weight must be between 0 and 1" };
  }

  return { isValid: true };
};

export const createDefaultSortingConfig = (
  statIndex: number
): SortingConfig => ({
  stat: statIndex,
  weight: 1,
});

export const normalizeSortingWeights = (
  configs: SortingConfig[]
): SortingConfig[] => {
  const totalWeight = configs.reduce((sum, config) => sum + config.weight, 0);

  if (totalWeight === 0) return configs;

  return configs.map((config) => ({
    ...config,
    weight: config.weight / totalWeight,
  }));
};
