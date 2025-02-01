"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AuthError } from "@supabase/supabase-js";
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
import { Item, GroupWithItems, TierListWithStats } from "./types";
import { GroupCard } from "./GroupCard";
import { TierListCard } from "./TierListCard";
import {
  createGroup,
  createTierList,
  deleteGroup,
  deleteTierList,
  getUserContent,
  updateGroupPosition,
  updateTierListPosition,
} from "@/utils/supabase/server";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function DashboardContent() {
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
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
    const fetchUserContent = async () => {
      try {
        console.log("Fetching session...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.error("No session or user found");
          router.push("/auth/login");
          return;
        }

        console.log("Session found, user ID:", session.user.id);
        setUserId(session.user.id);

        console.log("Fetching user content...");
        const content = await getUserContent(session.user.id);
        console.log("Content fetched successfully:", content);

        // Transform tier lists first
        const transformedTierLists = content.tierLists.map((tierList) => ({
          ...tierList,
          creator: "You",
          likes: 0,
          views: 0,
          image: "/placeholder.svg?height=100&width=200",
        }));

        // Create a map of group IDs to their tier lists
        const groupTierLists = new Map();
        content.groupTierLists.forEach((relation) => {
          if (!groupTierLists.has(relation.group_id)) {
            groupTierLists.set(relation.group_id, []);
          }
          const tierList = transformedTierLists.find((tl) => tl.id === relation.tier_list_id);
          if (tierList) {
            groupTierLists.get(relation.group_id).push(tierList);
          }
        });

        // Transform groups with their tier lists
        const transformedGroups = content.groups.map((group) => ({
          ...group,
          items: groupTierLists.get(group.id) || [],
          isGroup: true,
        }));

        // Root level items are groups and tier lists not in any group
        const usedTierListIds = new Set(content.groupTierLists.map((rel) => rel.tier_list_id));
        const rootTierLists = transformedTierLists.filter((tl) => !usedTierListIds.has(tl.id));

        const transformedItems: Item[] = [...transformedGroups, ...rootTierLists];

        console.log("Setting transformed items:", transformedItems);
        setItems(transformedItems);
      } catch (error: unknown) {
        console.error("Detailed error in fetchUserContent:", error);

        if (error instanceof AuthError) {
          console.error("Auth error details:", {
            message: error.message,
            status: error.status,
            name: error.name,
          });
          setError(error.message);
          router.push("/auth/login");
        } else if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
          setError(error.message);
        } else {
          console.error("Unknown error type:", error);
          setError("An unexpected error occurred");
        }
      }
    };

    fetchUserContent();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        console.log("No session found, redirecting to login");
        router.push("/auth/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleCreateGroup = async () => {
    if (newGroupName.trim() && userId) {
      setIsLoading(true);
      setError(null);
      try {
        const newGroup = await createGroup(userId, newGroupName);
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

  const handleDeleteTierList = async (itemId: string) => {
    setError(null);
    try {
      await deleteTierList(itemId);
      setItems((items) => items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting tier list:", error);
      setError("Failed to delete tier list");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setError(null);
    try {
      await deleteGroup(itemId);
      const deleteRecursively = (items: Item[]): Item[] => {
        return items.filter((item) => {
          if ("isGroup" in item && item.id === itemId) {
            return false;
          }
          if ("isGroup" in item) {
            item.items = deleteRecursively(item.items);
          }
          return true;
        });
      };
      setItems(deleteRecursively(items));
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete group");
    }
  };

  const handleCreateTierList = async () => {
    if (newTierListName.trim() && userId) {
      setIsLoading(true);
      setError(null);
      try {
        const currentGroup = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
        const newTierList = await createTierList(userId, newTierListName, null, currentGroup);
        if (!newTierList) {
          throw new Error("Failed to create tier list");
        }

        const transformedTierList = {
          ...newTierList,
          creator: "You",
          likes: 0,
          views: 0,
          image: "/placeholder.svg?height=100&width=200",
        };

        if (currentGroup) {
          // Add tier list to current group
          setItems((items) =>
            items.map((item) => {
              if ("isGroup" in item && item.id === currentGroup) {
                return {
                  ...item,
                  items: [...item.items, transformedTierList],
                };
              }
              return item;
            })
          );
        } else {
          // Add tier list to root level
          setItems((items) => [...items, transformedTierList]);
        }

        setNewTierListName("");
        setIsTierListDialogOpen(false);
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          router.refresh();
        }, 0);
      } catch (error) {
        console.error("Error creating tier list:", error);
        setError("Failed to create tier list");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [activeId, setActiveId] = useState<string | null>(null);

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

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    onDragEnd(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    // Check if we're dragging over a navigation area
    if (over.id.toString().startsWith("navigation-")) {
      const groupId = over.id.toString().replace("navigation-", "");
      const overItem = items.find((item) => item.id === groupId);

      if (overItem && "isGroup" in overItem && overItem.isGroup) {
        // Only change path if we're not already in this group
        if (!currentPath.includes(overItem.id)) {
          setCurrentPath([overItem.id]);
        }
      }
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Handle dropping into a group or reordering
    if (over.id.toString().startsWith("droppable-")) {
      const groupId = over.id.toString().replace("droppable-", "");
      const targetGroup = items.find((item) => item.id === groupId);
      const draggedItem = items.find((item) => item.id === active.id);

      if (targetGroup && "isGroup" in targetGroup && draggedItem && !("isGroup" in draggedItem)) {
        // Remove from current location
        setItems((items) => items.filter((item) => item.id !== active.id));

        // Add to new group
        setItems((items) =>
          items.map((item) => {
            if (item.id === groupId && "isGroup" in item) {
              return {
                ...item,
                items: [...item.items, draggedItem],
              };
            }
            return item;
          })
        );

        // Update the database
        updateTierListPosition(groupId, draggedItem.id, targetGroup.items.length).catch((error) => {
          console.error("Error updating tier list position:", error);
          setError("Failed to update position");
        });

        return;
      }
    }

    // Reset current path if we're not dropping into the current group
    setCurrentPath([]);

    // Handle normal reordering
    if (active.id !== over.id) {
      setItems((items) => {
        const updateItemsRecursively = (items: Item[], currentGroupId: string | null): Item[] => {
          if (currentGroupId === null) {
            // Root level
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);

            const item = newItems[newIndex];
            if ("isGroup" in item) {
              updateGroupPosition(item.id, newIndex).catch((error) => {
                console.error("Error updating group position:", error);
                setError("Failed to update position");
              });
            } else {
              updateTierListPosition(null, item.id, newIndex).catch((error) => {
                console.error("Error updating tier list position:", error);
                setError("Failed to update position");
              });
            }

            return newItems;
          } else {
            // Inside a group
            return items.map((item) => {
              if ("isGroup" in item && item.id === currentGroupId) {
                const oldIndex = item.items.findIndex((i) => i.id === active.id);
                const newIndex = item.items.findIndex((i) => i.id === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                  const newItems = arrayMove(item.items, oldIndex, newIndex);
                  const movedItem = newItems[newIndex];
                  if (!("isGroup" in movedItem)) {
                    updateTierListPosition(currentGroupId, movedItem.id, newIndex).catch((error) => {
                      console.error("Error updating tier list position:", error);
                      setError("Failed to update position");
                    });
                  }
                  return { ...item, items: newItems };
                }
              }
              return item;
            });
          }
        };

        const currentGroup = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
        return updateItemsRecursively(items, currentGroup);
      });
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(selectedItem === item.id ? null : item.id);
  };

  const handleItemDoubleClick = useCallback(
    (item: Item) => {
      if ("isGroup" in item) {
        setCurrentPath([...currentPath, item.id]);
      } else {
        router.push(`/tier-list/${item.id}`);
      }
    },
    [currentPath, router]
  );

  const getCurrentItems = useCallback((): Item[] => {
    let currentItems = items;
    for (const groupId of currentPath) {
      const group = currentItems.find((item) => "isGroup" in item && item.id === groupId) as GroupWithItems;
      if (group) {
        currentItems = group.items;
      } else {
        break;
      }
    }
    return currentItems;
  }, [items, currentPath]);

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedItem) {
        const selectedItemData = getCurrentItems().find((item) => item.id === selectedItem);
        if (selectedItemData) {
          handleItemDoubleClick(selectedItemData);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, currentPath, getCurrentItems, handleItemDoubleClick]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <Header isLoggedIn={true} />
        <main className="flex-1 p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <DashboardHeader
            currentPath={currentPath}
            onNavigateUp={navigateUp}
            onOpenTierListDialog={() => setIsTierListDialogOpen(true)}
            onOpenGroupDialog={() => setIsGroupDialogOpen(true)}
          />

          <div className="relative">
            <DashboardGrid
              items={getCurrentItems()}
              selectedItem={selectedItem}
              onItemClick={handleItemClick}
              onItemDoubleClick={handleItemDoubleClick}
              onDeleteGroup={handleDeleteItem}
              onDeleteTierList={handleDeleteTierList}
            />
            {/* Invisible overlay to prevent unwanted group navigation during drag */}
            {activeId && <div className="absolute inset-0 bg-transparent" />}
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
        </main>
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && (
          <div className="opacity-75">
            {(() => {
              const item = items.find((item) => item.id === activeId);
              if (!item) return null;

              if ("isGroup" in item && item.isGroup) {
                return <GroupCard group={item} isSelected={false} onDelete={() => {}} />;
              }

              // At this point TypeScript knows item must be TierListWithStats
              const tierList = item as TierListWithStats;
              return <TierListCard tierList={tierList} isSelected={false} />;
            })()}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
