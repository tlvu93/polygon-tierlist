import type { Meta, StoryObj } from "@storybook/react";
import { FileExplorer, LocalStorageFileExplorer } from "./index";
import { FileItem, FolderItem } from "./types";
import { FileText, Folder, Image, Music, Video } from "lucide-react";
import React from "react";

const meta: Meta<typeof FileExplorer> = {
  title: "Components/FileExplorer",
  component: FileExplorer,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    allowDragAndDrop: {
      control: "boolean",
      description: "Enable drag and drop functionality",
    },
    allowMultiSelect: {
      control: "boolean",
      description: "Allow selecting multiple items",
    },
    showFileSize: {
      control: "boolean",
      description: "Show file size information",
    },
    showModifiedDate: {
      control: "boolean",
      description: "Show modified date information",
    },
    emptyStateMessage: {
      control: "text",
      description: "Custom message when no items are present",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Create a storage instance for stories with local state
const createStorage = () => {
  // Create a simple in-memory storage for Storybook
  let items: any[] = [];

  const storage = {
    async getItems() {
      return items;
    },

    async createFile(name: string, parentId?: string) {
      const newFile = {
        id: Date.now().toString(),
        name,
        type: "file" as const,
        size: Math.floor(Math.random() * 1024 * 1024),
        modifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (parentId) {
        // Add to specific folder
        const addToFolder = (items: any[]): any[] => {
          return items.map((item) => {
            if (item.id === parentId && item.type === "folder") {
              return { ...item, items: [...item.items, newFile] };
            }
            if (item.type === "folder") {
              return { ...item, items: addToFolder(item.items) };
            }
            return item;
          });
        };
        items = addToFolder(items);
      } else {
        // Add to root
        items = [...items, newFile];
      }

      return newFile;
    },

    async createFolder(name: string, parentId?: string) {
      const newFolder = {
        id: Date.now().toString(),
        name,
        type: "folder" as const,
        items: [],
        modifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (parentId) {
        // Add to specific folder
        const addToFolder = (items: any[]): any[] => {
          return items.map((item) => {
            if (item.id === parentId && item.type === "folder") {
              return { ...item, items: [...item.items, newFolder] };
            }
            if (item.type === "folder") {
              return { ...item, items: addToFolder(item.items) };
            }
            return item;
          });
        };
        items = addToFolder(items);
      } else {
        // Add to root
        items = [...items, newFolder];
      }

      return newFolder;
    },

    async deleteItem(id: string) {
      const removeItem = (items: any[]): any[] => {
        return items.filter((item) => {
          if (item.id === id) return false;
          if (item.type === "folder") {
            item.items = removeItem(item.items);
          }
          return true;
        });
      };
      items = removeItem(items);
      return true;
    },

    async updateItem(id: string, updates: any) {
      const updateItem = (items: any[]): any[] => {
        return items.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...updates,
              modifiedAt: new Date().toISOString(),
            };
          }
          if (item.type === "folder") {
            return { ...item, items: updateItem(item.items) };
          }
          return item;
        });
      };
      items = updateItem(items);
      return items.find((item) => item.id === id) || null;
    },

    async moveItem(itemId: string, targetFolderId?: string) {
      // Find the item to move
      let itemToMove: any = null;
      const findItem = (items: any[]): any[] => {
        return items.filter((item) => {
          if (item.id === itemId) {
            itemToMove = item;
            return false;
          }
          if (item.type === "folder") {
            item.items = findItem(item.items);
          }
          return true;
        });
      };

      items = findItem(items);

      if (itemToMove) {
        if (targetFolderId) {
          // Add to target folder
          const addToFolder = (items: any[]): any[] => {
            return items.map((item) => {
              if (item.id === targetFolderId && item.type === "folder") {
                return { ...item, items: [...item.items, itemToMove] };
              }
              if (item.type === "folder") {
                return { ...item, items: addToFolder(item.items) };
              }
              return item;
            });
          };
          items = addToFolder(items);
        } else {
          // Move to root
          items = [...items, itemToMove];
        }
      }

      return true;
    },

    async reorderItems(itemIds: string[], parentId?: string) {
      if (parentId) {
        // Reorder within a specific folder
        const reorderInFolder = (items: any[]): any[] => {
          return items.map((item) => {
            if (item.id === parentId && item.type === "folder") {
              const orderedItems = itemIds
                .map((id) => item.items.find((i: any) => i.id === id))
                .filter(Boolean);
              return { ...item, items: orderedItems };
            }
            if (item.type === "folder") {
              return { ...item, items: reorderInFolder(item.items) };
            }
            return item;
          });
        };
        items = reorderInFolder(items);
      } else {
        // Reorder root items
        const orderedItems = itemIds
          .map((id) => items.find((item) => item.id === id))
          .filter(Boolean);
        items = orderedItems;
      }
    },
  };

  return storage;
};

// Custom icon renderers
const customFileIcon = (file: FileItem) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <Image className="h-8 w-8 text-green-500" />;
    case "mp3":
    case "wav":
    case "flac":
      return <Music className="h-8 w-8 text-purple-500" />;
    case "mp4":
    case "avi":
    case "mov":
      return <Video className="h-8 w-8 text-red-500" />;
    default:
      return <FileText className="h-8 w-8 text-blue-500" />;
  }
};

const customFolderIcon = (folder: FolderItem) => {
  return <Folder className="h-8 w-8 text-yellow-500" />;
};

export const Default: Story = {
  args: {
    storage: createStorage(),
    allowDragAndDrop: true,
    allowMultiSelect: false,
    showFileSize: true,
    showModifiedDate: true,
    emptyStateMessage:
      "No items found. Start by creating a new file or folder!",
  },
};

export const WithCustomIcons: Story = {
  args: {
    storage: createStorage(),
    renderFileIcon: customFileIcon,
    renderFolderIcon: customFolderIcon,
    allowDragAndDrop: true,
    allowMultiSelect: false,
    showFileSize: true,
    showModifiedDate: true,
  },
};

export const MultiSelect: Story = {
  args: {
    storage: createStorage(),
    allowDragAndDrop: true,
    allowMultiSelect: true,
    showFileSize: true,
    showModifiedDate: true,
  },
};

export const NoDragAndDrop: Story = {
  args: {
    storage: createStorage(),
    allowDragAndDrop: false,
    allowMultiSelect: false,
    showFileSize: true,
    showModifiedDate: true,
  },
};

export const Minimal: Story = {
  args: {
    storage: createStorage(),
    allowDragAndDrop: false,
    allowMultiSelect: false,
    showFileSize: false,
    showModifiedDate: false,
  },
};

export const WithEventHandlers: Story = {
  args: {
    storage: createStorage(),
    allowDragAndDrop: true,
    allowMultiSelect: false,
    showFileSize: true,
    showModifiedDate: true,
    onFileClick: (file: FileItem) => console.log("File clicked:", file.name),
    onFileDoubleClick: (file: FileItem) =>
      console.log("File double-clicked:", file.name),
    onFolderClick: (folder: FolderItem) =>
      console.log("Folder clicked:", folder.name),
    onFolderDoubleClick: (folder: FolderItem) =>
      console.log("Folder double-clicked:", folder.name),
    onItemDelete: (item: FileItem | FolderItem) =>
      console.log("Item deleted:", item.name),
  },
};

export const EmptyState: Story = {
  args: {
    storage: new LocalStorageFileExplorer(), // Empty storage
    allowDragAndDrop: true,
    allowMultiSelect: false,
    showFileSize: true,
    showModifiedDate: true,
    emptyStateMessage:
      "Your file explorer is empty. Create your first file or folder to get started!",
  },
};
