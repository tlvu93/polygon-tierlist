import {
  FileExplorerStorage,
  ExplorerItem,
  FileItem,
  FolderItem,
} from "../types";

const STORAGE_KEY = "file-explorer-items";

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Helper function to find and update items recursively
const findAndUpdateItem = (
  items: ExplorerItem[],
  itemId: string,
  updater: (item: ExplorerItem) => ExplorerItem
): ExplorerItem[] => {
  return items.map((item) => {
    if (item.id === itemId) {
      return updater(item);
    }
    if (item.type === "folder") {
      return {
        ...item,
        items: findAndUpdateItem(item.items, itemId, updater),
      };
    }
    return item;
  });
};

// Helper function to find and remove items recursively
const findAndRemoveItem = (
  items: ExplorerItem[],
  itemId: string
): ExplorerItem[] => {
  return items.filter((item) => {
    if (item.id === itemId) {
      return false;
    }
    if (item.type === "folder") {
      item.items = findAndRemoveItem(item.items, itemId);
    }
    return true;
  });
};

// Helper function to find parent folder recursively
const findParentFolder = (
  items: ExplorerItem[],
  itemId: string,
  parentId?: string
): string | null => {
  for (const item of items) {
    if (item.type === "folder") {
      if (item.items.some((child) => child.id === itemId)) {
        return item.id;
      }
      const found = findParentFolder(item.items, itemId, item.id);
      if (found) return found;
    }
  }
  return parentId || null;
};

// Helper function to find item by ID recursively
const findItemById = (
  items: ExplorerItem[],
  itemId: string
): ExplorerItem | null => {
  for (const item of items) {
    if (item.id === itemId) {
      return item;
    }
    if (item.type === "folder") {
      const found = findItemById(item.items, itemId);
      if (found) return found;
    }
  }
  return null;
};

export class LocalStorageFileExplorer implements FileExplorerStorage {
  private getItemsFromStorage(): ExplorerItem[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveItemsToStorage(items: ExplorerItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  async getItems(): Promise<ExplorerItem[]> {
    return this.getItemsFromStorage();
  }

  async createFile(name: string, parentId?: string): Promise<FileItem> {
    const items = this.getItemsFromStorage();
    const newFile: FileItem = {
      id: generateId(),
      name,
      type: "file",
      size: Math.floor(Math.random() * 1024 * 1024), // Random size for demo
      modifiedAt: getTimestamp(),
      createdAt: getTimestamp(),
    };

    if (parentId) {
      // Add to specific folder
      const updatedItems = findAndUpdateItem(items, parentId, (item) => {
        if (item.type === "folder") {
          return {
            ...item,
            items: [...item.items, newFile],
            modifiedAt: getTimestamp(),
          };
        }
        return item;
      });
      this.saveItemsToStorage(updatedItems);
    } else {
      // Add to root
      this.saveItemsToStorage([...items, newFile]);
    }

    return newFile;
  }

  async createFolder(name: string, parentId?: string): Promise<FolderItem> {
    const items = this.getItemsFromStorage();
    const newFolder: FolderItem = {
      id: generateId(),
      name,
      type: "folder",
      items: [],
      modifiedAt: getTimestamp(),
      createdAt: getTimestamp(),
    };

    if (parentId) {
      // Add to specific folder
      const updatedItems = findAndUpdateItem(items, parentId, (item) => {
        if (item.type === "folder") {
          return {
            ...item,
            items: [...item.items, newFolder],
            modifiedAt: getTimestamp(),
          };
        }
        return item;
      });
      this.saveItemsToStorage(updatedItems);
    } else {
      // Add to root
      this.saveItemsToStorage([...items, newFolder]);
    }

    return newFolder;
  }

  async deleteItem(id: string): Promise<boolean> {
    const items = this.getItemsFromStorage();
    const item = findItemById(items, id);
    if (!item) return false;

    const updatedItems = findAndRemoveItem(items, id);
    this.saveItemsToStorage(updatedItems);
    return true;
  }

  async updateItem(
    id: string,
    updates: Partial<ExplorerItem>
  ): Promise<ExplorerItem | null> {
    const items = this.getItemsFromStorage();
    const item = findItemById(items, id);
    if (!item) return null;

    const updatedItems = findAndUpdateItem(items, id, (item) => {
      const updatedItem = {
        ...item,
        ...updates,
        modifiedAt: getTimestamp(),
      };
      return updatedItem as ExplorerItem;
    });

    this.saveItemsToStorage(updatedItems);
    return findItemById(updatedItems, id);
  }

  async moveItem(itemId: string, targetFolderId?: string): Promise<boolean> {
    const items = this.getItemsFromStorage();
    const item = findItemById(items, itemId);
    if (!item) return false;

    // Remove from current location
    const itemsWithoutItem = findAndRemoveItem(items, itemId);

    if (targetFolderId) {
      // Add to target folder
      const updatedItems = findAndUpdateItem(
        itemsWithoutItem,
        targetFolderId,
        (folder) => {
          if (folder.type === "folder") {
            return {
              ...folder,
              items: [...folder.items, item],
              modifiedAt: getTimestamp(),
            };
          }
          return folder;
        }
      );
      this.saveItemsToStorage(updatedItems);
    } else {
      // Move to root
      this.saveItemsToStorage([...itemsWithoutItem, item]);
    }

    return true;
  }

  async reorderItems(itemIds: string[], parentId?: string): Promise<void> {
    const items = this.getItemsFromStorage();

    if (parentId) {
      // Reorder within a specific folder
      const updatedItems = findAndUpdateItem(items, parentId, (folder) => {
        if (folder.type === "folder") {
          const orderedItems = itemIds
            .map((id) => folder.items.find((item) => item.id === id))
            .filter(Boolean) as ExplorerItem[];

          return {
            ...folder,
            items: orderedItems,
            modifiedAt: getTimestamp(),
          };
        }
        return folder;
      });
      this.saveItemsToStorage(updatedItems);
    } else {
      // Reorder root items
      const orderedItems = itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean) as ExplorerItem[];

      this.saveItemsToStorage(orderedItems);
    }
  }
}
