export interface LocalTierList {
  id: string;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at: string;
  creator: string;
  likes: number;
  views: number;
  image: string;
}

export interface LocalGroup {
  id: string;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at: string;
  items: LocalTierList[];
  isGroup: true;
}

export type LocalItem = LocalTierList | LocalGroup;

const STORAGE_KEYS = {
  GROUPS: "polygon-tierlist-groups",
  TIER_LISTS: "polygon-tierlist-tierlists",
  GROUP_TIER_LIST_RELATIONS: "polygon-tierlist-group-tierlist-relations",
};

// Generate a unique ID for local items
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Local Storage API
export const localStorageAPI = {
  // Groups
  getGroups: (): LocalGroup[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.GROUPS);
    return stored ? JSON.parse(stored) : [];
  },

  createGroup: (name: string): LocalGroup => {
    const groups = localStorageAPI.getGroups();
    const newGroup: LocalGroup = {
      id: generateId(),
      name,
      position: groups.length,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
      items: [],
      isGroup: true,
    };

    groups.push(newGroup);
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    return newGroup;
  },

  updateGroup: (
    id: string,
    updates: Partial<LocalGroup>
  ): LocalGroup | null => {
    const groups = localStorageAPI.getGroups();
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return null;

    groups[index] = {
      ...groups[index],
      ...updates,
      updated_at: getTimestamp(),
    };
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    return groups[index];
  },

  deleteGroup: (id: string): boolean => {
    const groups = localStorageAPI.getGroups();
    const filtered = groups.filter((g) => g.id !== id);
    if (filtered.length === groups.length) return false;

    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(filtered));
    return true;
  },

  // Tier Lists
  getTierLists: (): LocalTierList[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TIER_LISTS);
    return stored ? JSON.parse(stored) : [];
  },

  createTierList: (name: string): LocalTierList => {
    const tierLists = localStorageAPI.getTierLists();
    const newTierList: LocalTierList = {
      id: generateId(),
      name,
      position: tierLists.length,
      created_at: getTimestamp(),
      updated_at: getTimestamp(),
      creator: "You",
      likes: 0,
      views: 0,
      image: "/placeholder.svg?height=100&width=200",
    };

    tierLists.push(newTierList);
    localStorage.setItem(STORAGE_KEYS.TIER_LISTS, JSON.stringify(tierLists));
    return newTierList;
  },

  updateTierList: (
    id: string,
    updates: Partial<LocalTierList>
  ): LocalTierList | null => {
    const tierLists = localStorageAPI.getTierLists();
    const index = tierLists.findIndex((tl) => tl.id === id);
    if (index === -1) return null;

    tierLists[index] = {
      ...tierLists[index],
      ...updates,
      updated_at: getTimestamp(),
    };
    localStorage.setItem(STORAGE_KEYS.TIER_LISTS, JSON.stringify(tierLists));
    return tierLists[index];
  },

  deleteTierList: (id: string): boolean => {
    const tierLists = localStorageAPI.getTierLists();
    const filtered = tierLists.filter((tl) => tl.id !== id);
    if (filtered.length === tierLists.length) return false;

    localStorage.setItem(STORAGE_KEYS.TIER_LISTS, JSON.stringify(filtered));
    return true;
  },

  // Group-TierList Relations
  getGroupTierListRelations: (): {
    group_id: string;
    tier_list_id: string;
  }[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEYS.GROUP_TIER_LIST_RELATIONS);
    return stored ? JSON.parse(stored) : [];
  },

  addTierListToGroup: (groupId: string, tierListId: string): void => {
    const relations = localStorageAPI.getGroupTierListRelations();
    relations.push({ group_id: groupId, tier_list_id: tierListId });
    localStorage.setItem(
      STORAGE_KEYS.GROUP_TIER_LIST_RELATIONS,
      JSON.stringify(relations)
    );
  },

  removeTierListFromGroup: (groupId: string, tierListId: string): void => {
    const relations = localStorageAPI.getGroupTierListRelations();
    const filtered = relations.filter(
      (r) => !(r.group_id === groupId && r.tier_list_id === tierListId)
    );
    localStorage.setItem(
      STORAGE_KEYS.GROUP_TIER_LIST_RELATIONS,
      JSON.stringify(filtered)
    );
  },

  // Combined data for dashboard
  getAllItems: (): LocalItem[] => {
    const groups = localStorageAPI.getGroups();
    const tierLists = localStorageAPI.getTierLists();
    const relations = localStorageAPI.getGroupTierListRelations();

    // Create a map of group IDs to their tier lists
    const groupTierLists = new Map<string, LocalTierList[]>();
    relations.forEach((relation) => {
      if (!groupTierLists.has(relation.group_id)) {
        groupTierLists.set(relation.group_id, []);
      }
      const tierList = tierLists.find((tl) => tl.id === relation.tier_list_id);
      if (tierList) {
        groupTierLists.get(relation.group_id)!.push(tierList);
      }
    });

    // Transform groups with their tier lists
    const transformedGroups: LocalItem[] = groups.map(
      (group) =>
        ({
          ...group,
          items: groupTierLists.get(group.id) || [],
          isGroup: true,
        } as LocalGroup)
    );

    // Root level items are tier lists not in any group
    const usedTierListIds = new Set(relations.map((rel) => rel.tier_list_id));
    const rootTierLists = tierLists.filter((tl) => !usedTierListIds.has(tl.id));

    return [...transformedGroups, ...rootTierLists];
  },

  // Position updates
  updateGroupPosition: (id: string, newPosition: number): void => {
    const groups = localStorageAPI.getGroups();
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return;

    groups[index].position = newPosition;
    groups[index].updated_at = getTimestamp();
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  },

  updateTierListPosition: (id: string, newPosition: number): void => {
    const tierLists = localStorageAPI.getTierLists();
    const index = tierLists.findIndex((tl) => tl.id === id);
    if (index === -1) return;

    tierLists[index].position = newPosition;
    tierLists[index].updated_at = getTimestamp();
    localStorage.setItem(STORAGE_KEYS.TIER_LISTS, JSON.stringify(tierLists));
  },
};
