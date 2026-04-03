"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import Header from "@/app/components/Header";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardGrid } from "./DashboardGrid";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { CreateTierListDialog } from "./CreateTierListDialog";
import { GroupCard } from "./GroupCard";
import { TierListCard } from "./TierListCard";
import {
  localStorageAPI,
  LocalItem,
  LocalGroup,
  LocalTierList,
} from "@/utils/localStorage";

export default function DashboardContent() {
  const [items, setItems] = useState<LocalItem[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isTierListDialogOpen, setIsTierListDialogOpen] = useState(false);
  const [newTierListName, setNewTierListName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadItems = () => {
      try {
        const allItems = localStorageAPI.getAllItems();
        setItems(allItems);
      } catch (error) {
        console.error("Error loading items:", error);
        setError("Failed to load items");
      }
    };

    loadItems();
  }, []);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const newGroup = localStorageAPI.createGroup(newGroupName);
        setItems([...items, { ...newGroup, items: [], isGroup: true }]);
        setNewGroupName("");
        setIsGroupDialogOpen(false);
      } catch (error) {
        console.error("Error creating group:", error);
        setError("Failed to create group");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteTierList = (itemId: string) => {
    setError(null);
    try {
      const success = localStorageAPI.deleteTierList(itemId);
      if (success) {
        setItems((items) => items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Error deleting tier list:", error);
      setError("Failed to delete tier list");
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setError(null);
    try {
      const success = localStorageAPI.deleteGroup(itemId);
      if (success) {
        const deleteRecursively = (items: LocalItem[]): LocalItem[] => {
          return items.filter((item) => {
            if ("isGroup" in item && item.id === itemId) {
              return false;
            }
            if ("isGroup" in item) {
              item.items = deleteRecursively(item.items).filter(
                (i): i is LocalTierList => !("isGroup" in i)
              );
            }
            return true;
          });
        };
        setItems(deleteRecursively);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  const handleCreateTierList = () => {
    if (newTierListName.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const currentGroup =
          currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
        const newTierList = localStorageAPI.createTierList(newTierListName);

        if (currentGroup) {
          // Add to current group
          localStorageAPI.addTierListToGroup(currentGroup, newTierList.id);
          setItems((items) => {
            return items.map((item) => {
              if ("isGroup" in item && item.id === currentGroup) {
                return { ...item, items: [...item.items, newTierList] };
              }
              return item;
            });
          });
        } else {
          // Add to root level
          setItems([...items, newTierList]);
        }

        setNewTierListName("");
        setIsTierListDialogOpen(false);
      } catch (error) {
        console.error("Error creating tier list:", error);
        setError("Failed to create tier list");
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  const handleDragStart = (event: DragStartEvent) => {
    setSelectedItem(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const draggedItem = items.find((item) => item.id === active.id.toString());
    const targetItem = items.find((item) => item.id === over.id.toString());

    if (!draggedItem || !targetItem) return;

    // Only allow files to be dropped into groups
    if (targetItem && "isGroup" in targetItem && !("isGroup" in draggedItem)) {
      // If the item is already in a group, remove it first
      let sourceGroupId: string | null = null;
      items.forEach((item) => {
        if (
          "isGroup" in item &&
          item.items.some((i) => i.id === active.id.toString())
        ) {
          sourceGroupId = item.id;
        }
      });

      if (sourceGroupId) {
        localStorageAPI.removeTierListFromGroup(
          sourceGroupId,
          active.id.toString()
        );
      }

      // Add to new group
      localStorageAPI.addTierListToGroup(targetItem.id, active.id.toString());

      // Update UI
      setItems((items) => {
        return items.map((item) => {
          if ("isGroup" in item && item.id === sourceGroupId) {
            return {
              ...item,
              items: item.items.filter((i) => i.id !== active.id.toString()),
            };
          }
          if ("isGroup" in item && item.id === targetItem.id) {
            return {
              ...item,
              items: [...item.items, draggedItem as LocalTierList],
            };
          }
          return item;
        });
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active) return;

    const draggedItem = items.find((item) => item.id === active.id.toString());
    if (!draggedItem) return;

    // Handle dropping into a group
    if ("isGroup" in draggedItem) {
      // Group reordering at root level
      if (active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.findIndex(
            (item) => item.id === active.id.toString()
          );
          const newIndex = items.findIndex(
            (item) => item.id === over.id.toString()
          );
          const newItems = arrayMove(items, oldIndex, newIndex);

          // Update positions in localStorage
          newItems.forEach((item, index) => {
            if ("isGroup" in item) {
              localStorageAPI.updateGroupPosition(item.id, index);
            } else {
              localStorageAPI.updateTierListPosition(item.id, index);
            }
          });

          return newItems;
        });
      }
      return;
    }

    // Handle tier list reordering
    if (currentPath.length > 0) {
      // Reordering within a group
      const currentGroup = items.find(
        (item) =>
          "isGroup" in item && item.id === currentPath[currentPath.length - 1]
      ) as LocalGroup;

      if (currentGroup && active.id !== over.id) {
        setItems((items) => {
          return items.map((item) => {
            if ("isGroup" in item && item.id === currentGroup.id) {
              const oldIndex = item.items.findIndex(
                (i) => i.id === active.id.toString()
              );
              const newIndex = item.items.findIndex(
                (i) => i.id === over.id.toString()
              );
              const newItems = arrayMove(item.items, oldIndex, newIndex);

              // Update position in localStorage
              localStorageAPI.updateTierListPosition(
                active.id.toString(),
                newIndex
              );

              return { ...item, items: newItems };
            }
            return item;
          });
        });
      }
    } else {
      // Root level reordering
      if (active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.findIndex(
            (item) => item.id === active.id.toString()
          );
          const newIndex = items.findIndex(
            (item) => item.id === over.id.toString()
          );
          const newItems = arrayMove(items, oldIndex, newIndex);

          // Update position in localStorage
          localStorageAPI.updateTierListPosition(
            active.id.toString(),
            newIndex
          );

          return newItems;
        });
      }
    }
  };

  const getCurrentItems = (): LocalItem[] => {
    if (currentPath.length === 0) {
      return items;
    }

    const currentGroup = items.find(
      (item) =>
        "isGroup" in item && item.id === currentPath[currentPath.length - 1]
    ) as LocalGroup;

    return currentGroup ? currentGroup.items : [];
  };

  const handleItemClick = (item: LocalItem) => {
    setSelectedItem(selectedItem === item.id ? null : item.id);
  };

  const handleItemDoubleClick = useCallback(
    (item: LocalItem) => {
      if ("isGroup" in item) {
        setCurrentPath([...currentPath, item.id]);
      } else {
        router.push(`/tier-list/${item.id}`);
      }
    },
    [currentPath, router]
  );

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedItem) {
        const selectedItemData = getCurrentItems().find(
          (item) => item.id === selectedItem
        );
        if (selectedItemData) {
          handleItemDoubleClick(selectedItemData);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, currentPath, handleItemDoubleClick]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          currentPath={currentPath}
          onNavigateUp={navigateUp}
          onOpenTierListDialog={() => setIsTierListDialogOpen(true)}
          onOpenGroupDialog={() => setIsGroupDialogOpen(true)}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          onDragOver={handleDragOver}
        >
          <DashboardGrid
            items={getCurrentItems()}
            selectedItem={selectedItem}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onDeleteGroup={handleDeleteItem}
            onDeleteTierList={handleDeleteTierList}
          />

          <DragOverlay dropAnimation={dropAnimation}>
            {selectedItem
              ? (() => {
                  const item = getCurrentItems().find(
                    (item) => item.id === selectedItem
                  );
                  if (!item) return null;

                  if ("isGroup" in item && item.isGroup) {
                    return (
                      <GroupCard
                        group={item}
                        isSelected={false}
                        onDelete={() => {}}
                      />
                    );
                  }

                  return (
                    <TierListCard
                      tierList={item as LocalTierList}
                      isSelected={false}
                      onDelete={() => {}}
                    />
                  );
                })()
              : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateGroupDialog
        isOpen={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        newGroupName={newGroupName}
        onNameChange={setNewGroupName}
        onCreateGroup={handleCreateGroup}
        isLoading={isLoading}
      />

      <CreateTierListDialog
        isOpen={isTierListDialogOpen}
        onOpenChange={setIsTierListDialogOpen}
        newTierListName={newTierListName}
        onNameChange={setNewTierListName}
        onCreateTierList={handleCreateTierList}
        isLoading={isLoading}
      />
    </div>
  );
}
