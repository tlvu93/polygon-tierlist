import { describe, expect, it } from "vitest";
import {
  calculateSortedPolyLists,
  normalizeSortingWeights,
  validateSortingConfig,
} from "@/components/tier-list/utils/sorting.utils";
import type { PolyList } from "@/components/tier-list/types";

const polyList = (id: string, values: number[]): PolyList => ({
  id,
  name: id,
  thumbnail: "",
  stats: values.map((value, i) => ({ name: `Stat ${i + 1}`, value })),
});

describe("calculateSortedPolyLists", () => {
  it("returns the input unchanged when there are no sorting configs", () => {
    const lists = [polyList("a", [1, 2]), polyList("b", [9, 9])];
    expect(calculateSortedPolyLists(lists, [])).toBe(lists);
  });

  it("sorts descending by a single weighted stat by default", () => {
    const lists = [
      polyList("low", [1]),
      polyList("high", [9]),
      polyList("mid", [5]),
    ];

    const sorted = calculateSortedPolyLists(lists, [{ stat: 0, weight: 1 }]);

    expect(sorted.map((p) => p.id)).toEqual(["high", "mid", "low"]);
  });

  it("supports ascending order via options", () => {
    const lists = [polyList("low", [1]), polyList("high", [9])];

    const sorted = calculateSortedPolyLists(lists, [{ stat: 0, weight: 1 }], {
      direction: "asc",
      normalize: true,
    });

    expect(sorted.map((p) => p.id)).toEqual(["low", "high"]);
  });

  it("combines multiple weighted stats", () => {
    const lists = [
      // Wins on stat 0, loses on stat 1
      polyList("a", [10, 0]),
      // Loses on stat 0, wins big on stat 1
      polyList("b", [0, 10]),
    ];

    const sorted = calculateSortedPolyLists(lists, [
      { stat: 0, weight: 0.2 },
      { stat: 1, weight: 0.8 },
    ]);

    expect(sorted.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("does not mutate the original array", () => {
    const lists = [polyList("a", [1]), polyList("b", [9])];
    const original = [...lists];

    calculateSortedPolyLists(lists, [{ stat: 0, weight: 1 }]);

    expect(lists).toEqual(original);
  });
});

describe("validateSortingConfig", () => {
  it("rejects an out-of-range stat index", () => {
    expect(
      validateSortingConfig({ stat: -1, weight: 0.5 }, 5).isValid
    ).toBe(false);
    expect(
      validateSortingConfig({ stat: 5, weight: 0.5 }, 5).isValid
    ).toBe(false);
  });

  it("rejects a weight outside [0, 1]", () => {
    expect(validateSortingConfig({ stat: 0, weight: -0.1 }, 5).isValid).toBe(
      false
    );
    expect(validateSortingConfig({ stat: 0, weight: 1.1 }, 5).isValid).toBe(
      false
    );
  });

  it("accepts a valid config", () => {
    expect(validateSortingConfig({ stat: 2, weight: 0.5 }, 5)).toEqual({
      isValid: true,
    });
  });
});

describe("normalizeSortingWeights", () => {
  it("scales weights to sum to 1", () => {
    const normalized = normalizeSortingWeights([
      { stat: 0, weight: 2 },
      { stat: 1, weight: 2 },
    ]);

    expect(normalized.map((c) => c.weight)).toEqual([0.5, 0.5]);
  });

  it("returns the input unchanged when total weight is 0", () => {
    const configs = [
      { stat: 0, weight: 0 },
      { stat: 1, weight: 0 },
    ];
    expect(normalizeSortingWeights(configs)).toBe(configs);
  });
});
