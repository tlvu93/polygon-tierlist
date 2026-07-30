"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragOverEvent,
} from "@dnd-kit/core";
import type { DropAnimation } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  FileExplorerProps,
  ExplorerItem,
  FolderItem,
  FileExplorerState,
} from "./types";
import { FileExplorerHeader } from "./FileExplorerHeader";
import { FileExplorerGrid } from "./FileExplorerGrid";
import { CreateItemDialog } from "./CreateItemDialog";
import { FileCard } from "./FileCard";
import { FolderCard } from "./FolderCard";

export function FileExplorer({
  storage,
  onFileClick,
  onFileDoubleClick,
  onFolderClick,
  onFolderDoubleClick,
  onItemDelete,
  renderFileIcon,
  renderFolderIcon,
  className = "",
  emptyStateMessage = "No items found. Start by creating a new file or folder!",
  allowDragAndDrop = true,
  allowMultiSelect = false,
  showFileSize = true,
  showModifiedDate = true,
}: FileExplorerProps) {
  const [state, setState] = useState<FileExplorerState>({
    items: [],
    currentPath: [],
    selectedItems: new Set(),
    draggedItem: null,
    isLoading: false,
    error: null,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadItems = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const items = await storage.getItems();
      setState((prev) => ({ ...prev, items, isLoading: false }));
    } catch (error) {
      console.error("Error loading items:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load items",
        isLoading: false,
      }));
    }
  }, [storage]);

  // Load items on mount and when path changes
  useEffect(() => {
    loadItems();
  }, [state.currentPath, loadItems]);

  const getCurrentItems = (): ExplorerItem[] => {
    if (state.currentPath.length === 0) {
      return state.items;
    }

    const currentFolder = findFolderById(
      state.items,
      state.currentPath[state.currentPath.length - 1]
    );
    return currentFolder ? currentFolder.items : [];
  };

  const findFolderById = (
    items: ExplorerItem[],
    folderId: string
  ): FolderItem | null => {
    for (const item of items) {
      if (item.type === "folder") {
        if (item.id === folderId) {
          return item;
        }
        const found = findFolderById(item.items, folderId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const parentId =
        state.currentPath.length > 0
          ? state.currentPath[state.currentPath.length - 1]
          : undefined;

      if (newItemType === "file") {
        await storage.createFile(newItemName, parentId);
      } else {
        await storage.createFolder(newItemName, parentId);
      }

      await loadItems();
      setNewItemName("");
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating item:", error);
      setState((prev) => ({
        ...prev,
        error: `Failed to create ${newItemType}`,
        isLoading: false,
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const success = await storage.deleteItem(itemId);
      if (success) {
        await loadItems();
        const item = getCurrentItems().find((i) => i.id === itemId);
        if (item && onItemDelete) {
          onItemDelete(item);
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setState((prev) => ({ ...prev, error: "Failed to delete item" }));
    }
  };

  const handleItemClick = (item: ExplorerItem) => {
    if (allowMultiSelect) {
      setState((prev) => {
        const newSelected = new Set(prev.selectedItems);
        if (newSelected.has(item.id)) {
          newSelected.delete(item.id);
        } else {
          newSelected.add(item.id);
        }
        return { ...prev, selectedItems: newSelected };
      });
    } else {
      setState((prev) => ({
        ...prev,
        selectedItems: new Set([item.id]),
      }));
    }

    if (item.type === "file" && onFileClick) {
      onFileClick(item);
    } else if (item.type === "folder" && onFolderClick) {
      onFolderClick(item);
    }
  };

  const handleItemDoubleClick = useCallback(
    (item: ExplorerItem) => {
      if (item.type === "file" && onFileDoubleClick) {
        onFileDoubleClick(item);
      } else if (item.type === "folder" && onFolderDoubleClick) {
        onFolderDoubleClick(item);
      } else if (item.type === "folder") {
        // Navigate into folder
        setState((prev) => ({
          ...prev,
          currentPath: [...prev.currentPath, item.id],
          selectedItems: new Set(),
        }));
      }
    },
    [onFileDoubleClick, onFolderDoubleClick]
  );

  const handleNavigateUp = () => {
    setState((prev) => ({
      ...prev,
      currentPath: prev.currentPath.slice(0, -1),
      selectedItems: new Set(),
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!allowDragAndDrop) return;
    setState((prev) => ({ ...prev, draggedItem: event.active.id.toString() }));
  };

  const handleDragOver = async (event: DragOverEvent) => {
    if (!allowDragAndDrop) return;

    const { active, over } = event;
    if (!over || !active) return;

    const draggedItem = getCurrentItems().find(
      (item) => item.id === active.id.toString()
    );
    const targetItem = getCurrentItems().find(
      (item) => item.id === over.id.toString()
    );

    if (!draggedItem || !targetItem) return;

    // Only allow files to be dropped into folders
    if (targetItem.type === "folder" && draggedItem.type === "file") {
      try {
        await storage.moveItem(draggedItem.id, targetItem.id);
        await loadItems();
      } catch (error) {
        console.error("Error moving item:", error);
        setState((prev) => ({ ...prev, error: "Failed to move item" }));
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!allowDragAndDrop) return;

    const { active, over } = event;
    if (!over || !active) return;

    const draggedItem = getCurrentItems().find(
      (item) => item.id === active.id.toString()
    );
    if (!draggedItem) return;

    // Handle reordering
    if (active.id !== over.id) {
      const currentItems = getCurrentItems();
      const oldIndex = currentItems.findIndex(
        (item) => item.id === active.id.toString()
      );
      const newIndex = currentItems.findIndex(
        (item) => item.id === over.id.toString()
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);
        const itemIds = reorderedItems.map((item) => item.id);
        const parentId =
          state.currentPath.length > 0
            ? state.currentPath[state.currentPath.length - 1]
            : undefined;

        try {
          await storage.reorderItems(itemIds, parentId);
          await loadItems();
        } catch (error) {
          console.error("Error reordering items:", error);
          setState((prev) => ({ ...prev, error: "Failed to reorder items" }));
        }
      }
    }

    setState((prev) => ({ ...prev, draggedItem: null }));
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const currentItems = getCurrentItems();
  const currentFolderName =
    state.currentPath.length > 0
      ? findFolderById(
          state.items,
          state.currentPath[state.currentPath.length - 1]
        )?.name ?? "Unknown Folder"
      : "Root";

  return (
    <div className={`file-explorer ${className}`}>
      <FileExplorerHeader
        currentPath={state.currentPath}
        currentFolderName={currentFolderName}
        onNavigateUp={handleNavigateUp}
        onCreateFile={() => {
          setNewItemType("file");
          setIsCreateDialogOpen(true);
        }}
        onCreateFolder={() => {
          setNewItemType("folder");
          setIsCreateDialogOpen(true);
        }}
        canNavigateUp={state.currentPath.length > 0}
      />

      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      {state.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <FileExplorerGrid
            items={currentItems}
            selectedItems={state.selectedItems}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onDeleteItem={handleDeleteItem}
            renderFileIcon={renderFileIcon}
            renderFolderIcon={renderFolderIcon}
            showFileSize={showFileSize}
            showModifiedDate={showModifiedDate}
            emptyStateMessage={emptyStateMessage}
          />

          <DragOverlay dropAnimation={dropAnimation}>
            {state.draggedItem
              ? (() => {
                  const item = currentItems.find(
                    (i) => i.id === state.draggedItem
                  );
                  if (!item) return null;

                  if (item.type === "file") {
                    return (
                      <FileCard
                        file={item}
                        isSelected={false}
                        onDelete={() => {}}
                        renderIcon={renderFileIcon}
                        showFileSize={showFileSize}
                        showModifiedDate={showModifiedDate}
                      />
                    );
                  }

                  return (
                    <FolderCard
                      folder={item}
                      isSelected={false}
                      onDelete={() => {}}
                      renderIcon={renderFolderIcon}
                      showModifiedDate={showModifiedDate}
                    />
                  );
                })()
              : null}
          </DragOverlay>
        </DndContext>
      )}

      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        itemType={newItemType}
        itemName={newItemName}
        onNameChange={setNewItemName}
        onCreateItem={handleCreateItem}
        isLoading={state.isLoading}
      />
    </div>
  );
}
