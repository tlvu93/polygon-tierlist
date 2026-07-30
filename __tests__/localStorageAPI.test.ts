import { beforeEach, describe, expect, it } from "vitest";
import { localStorageAPI } from "@/utils/localStorage";

// This module is the persistence layer behind the dashboard's
// drag-and-drop reordering (see components/dashboard/DashboardContent.tsx
// onDragEnd, which calls updateGroupPosition / updateTierListPosition
// after @dnd-kit's arrayMove) and grouping (addTierListToGroup /
// removeTierListFromGroup, used when dragging a tier list card onto a
// group card).
beforeEach(() => {
  window.localStorage.clear();
});

describe("localStorageAPI", () => {
  it("creates tier lists with sequential positions", () => {
    const first = localStorageAPI.createTierList("First");
    const second = localStorageAPI.createTierList("Second");

    expect(first.position).toBe(0);
    expect(second.position).toBe(1);
    expect(localStorageAPI.getTierLists()).toHaveLength(2);
  });

  it("updateTierListPosition persists the new position for the right item", () => {
    const a = localStorageAPI.createTierList("A");
    const b = localStorageAPI.createTierList("B");

    localStorageAPI.updateTierListPosition(a.id, 5);

    const tierLists = localStorageAPI.getTierLists();
    expect(tierLists.find((t) => t.id === a.id)?.position).toBe(5);
    expect(tierLists.find((t) => t.id === b.id)?.position).toBe(1);
  });

  it("updateTierListPosition on an unknown id is a no-op", () => {
    localStorageAPI.createTierList("A");
    expect(() =>
      localStorageAPI.updateTierListPosition("nonexistent", 3)
    ).not.toThrow();
    expect(localStorageAPI.getTierLists()).toHaveLength(1);
  });

  it("updateGroupPosition persists the new position for the right group", () => {
    const g1 = localStorageAPI.createGroup("Group 1");
    const g2 = localStorageAPI.createGroup("Group 2");

    localStorageAPI.updateGroupPosition(g2.id, 0);

    const groups = localStorageAPI.getGroups();
    expect(groups.find((g) => g.id === g2.id)?.position).toBe(0);
    expect(groups.find((g) => g.id === g1.id)?.position).toBe(0); // unchanged from creation
  });

  it("moving a tier list into a group and back out updates getAllItems", () => {
    const group = localStorageAPI.createGroup("My Group");
    const tierList = localStorageAPI.createTierList("My Tier List");

    // Dropping the tier list card onto the group card (DragOver handler)
    localStorageAPI.addTierListToGroup(group.id, tierList.id);

    let items = localStorageAPI.getAllItems();
    const groupedItem = items.find((i) => i.id === group.id);
    expect(groupedItem && "isGroup" in groupedItem && groupedItem.isGroup).toBe(
      true
    );
    expect(
      groupedItem && "items" in groupedItem
        ? groupedItem.items.map((i) => i.id)
        : []
    ).toEqual([tierList.id]);
    // The tier list itself should no longer appear as a root-level item.
    expect(items.some((i) => i.id === tierList.id)).toBe(false);

    // Dragging it back out of the group.
    localStorageAPI.removeTierListFromGroup(group.id, tierList.id);

    items = localStorageAPI.getAllItems();
    const rootTierList = items.find((i) => i.id === tierList.id);
    expect(rootTierList).toBeDefined();
    expect(rootTierList && "isGroup" in rootTierList).toBe(false);
  });

  it("deleteGroup removes the group but does not error on repeat calls", () => {
    const group = localStorageAPI.createGroup("Doomed");
    expect(localStorageAPI.deleteGroup(group.id)).toBe(true);
    expect(localStorageAPI.getGroups()).toHaveLength(0);
    // Deleting again (e.g. a duplicate drag-end event) should report false,
    // not throw.
    expect(localStorageAPI.deleteGroup(group.id)).toBe(false);
  });
});
