import { beforeEach, describe, expect, it } from "vitest";
import {
  useTierListDataStore,
  createPolyList,
} from "@/stores/tierListDataStore";
import { DEFAULT_TIER_LIST_DATA } from "@/stores/types";

// The store persists to localStorage via zustand's `persist` middleware.
// Reset both the in-memory store and localStorage before each test so
// tests don't leak state into one another (jsdom gives us a real
// localStorage implementation per vitest.setup.ts).
beforeEach(() => {
  window.localStorage.clear();
  useTierListDataStore.setState({
    ...DEFAULT_TIER_LIST_DATA,
    _hasHydrated: true,
  });
});

describe("tierListDataStore", () => {
  it("adds a poly list and updates lastModified", () => {
    const before = useTierListDataStore.getState().lastModified;
    const polyList = createPolyList("Poly List 1", 5);

    useTierListDataStore.getState().addPolyList(polyList);

    const state = useTierListDataStore.getState();
    expect(state.polyLists).toHaveLength(1);
    expect(state.polyLists[0]).toEqual(polyList);
    expect(state.lastModified).not.toBe(before);
  });

  it("updates an existing poly list by id without touching others", () => {
    const a = createPolyList("A", 3);
    const b = createPolyList("B", 3);
    useTierListDataStore.setState({ polyLists: [a, b] });

    useTierListDataStore.getState().updatePolyList(a.id, { name: "Renamed" });

    const state = useTierListDataStore.getState();
    expect(state.polyLists.find((p) => p.id === a.id)?.name).toBe("Renamed");
    expect(state.polyLists.find((p) => p.id === b.id)?.name).toBe("B");
  });

  it("deleting the current poly list falls back to the first remaining one", () => {
    const a = createPolyList("A", 3);
    const b = createPolyList("B", 3);
    useTierListDataStore.setState({
      polyLists: [a, b],
      currentPolyListId: a.id,
    });

    useTierListDataStore.getState().deletePolyList(a.id);

    const state = useTierListDataStore.getState();
    expect(state.polyLists).toEqual([b]);
    expect(state.currentPolyListId).toBe(b.id);
  });

  it("deleting the last poly list clears currentPolyListId", () => {
    const a = createPolyList("A", 3);
    useTierListDataStore.setState({
      polyLists: [a],
      currentPolyListId: a.id,
    });

    useTierListDataStore.getState().deletePolyList(a.id);

    const state = useTierListDataStore.getState();
    expect(state.polyLists).toEqual([]);
    expect(state.currentPolyListId).toBe("");
  });

  it("deleting an id that isn't the current selection leaves currentPolyListId untouched", () => {
    const a = createPolyList("A", 3);
    const b = createPolyList("B", 3);
    useTierListDataStore.setState({
      polyLists: [a, b],
      currentPolyListId: b.id,
    });

    useTierListDataStore.getState().deletePolyList(a.id);

    expect(useTierListDataStore.getState().currentPolyListId).toBe(b.id);
  });

  it("clamps setStatCount to the [3, 8] range", () => {
    useTierListDataStore.getState().setStatCount(1);
    expect(useTierListDataStore.getState().statCount).toBe(3);

    useTierListDataStore.getState().setStatCount(20);
    expect(useTierListDataStore.getState().statCount).toBe(8);

    useTierListDataStore.getState().setStatCount(5);
    expect(useTierListDataStore.getState().statCount).toBe(5);
  });

  it("setStatCount grows every poly list's stats to match the new count", () => {
    const a = createPolyList("A", 3);
    useTierListDataStore.setState({ polyLists: [a], statCount: 3 });

    useTierListDataStore.getState().setStatCount(5);

    const stats = useTierListDataStore.getState().polyLists[0].stats;
    expect(stats).toHaveLength(5);
    expect(stats[3]).toEqual({ name: "Stat 4", value: 5.0 });
    expect(stats[4]).toEqual({ name: "Stat 5", value: 5.0 });
  });

  it("setStatCount shrinks every poly list's stats to match the new count", () => {
    const a = createPolyList("A", 5);
    useTierListDataStore.setState({ polyLists: [a], statCount: 5 });

    useTierListDataStore.getState().setStatCount(3);

    expect(useTierListDataStore.getState().polyLists[0].stats).toHaveLength(3);
  });

  it("updateStat updates only the targeted poly list's stat by index", () => {
    const a = createPolyList("A", 3);
    const b = createPolyList("B", 3);
    useTierListDataStore.setState({ polyLists: [a, b] });

    useTierListDataStore.getState().updateStat(a.id, 1, { value: 9.5 });

    const state = useTierListDataStore.getState();
    expect(state.polyLists.find((p) => p.id === a.id)?.stats[1].value).toBe(
      9.5
    );
    expect(state.polyLists.find((p) => p.id === b.id)?.stats[1].value).toBe(
      5.0
    );
  });

  it("resetData restores default state", () => {
    const a = createPolyList("A", 3);
    useTierListDataStore.setState({
      polyLists: [a],
      currentPolyListId: a.id,
      tierListName: "Custom Name",
    });

    useTierListDataStore.getState().resetData();

    const state = useTierListDataStore.getState();
    expect(state.polyLists).toEqual(DEFAULT_TIER_LIST_DATA.polyLists);
    expect(state.tierListName).toBe(DEFAULT_TIER_LIST_DATA.tierListName);
  });

  describe("sorting configs", () => {
    it("adds, updates, and removes sorting configs", () => {
      useTierListDataStore.getState().addSortingConfig({ stat: 0, weight: 1 });
      expect(useTierListDataStore.getState().sortingConfigs).toEqual([
        { stat: 0, weight: 1 },
      ]);

      useTierListDataStore.getState().updateSortingConfig(0, { weight: 0.5 });
      expect(useTierListDataStore.getState().sortingConfigs[0].weight).toBe(
        0.5
      );

      useTierListDataStore.getState().removeSortingConfig(0);
      expect(useTierListDataStore.getState().sortingConfigs).toEqual([]);
    });
  });
});
