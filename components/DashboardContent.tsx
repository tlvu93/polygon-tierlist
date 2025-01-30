"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Header from "@/app/components/Header";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardGrid } from "./dashboard/DashboardGrid";
import { CreateGroupDialog } from "./dashboard/CreateGroupDialog";
import { CreateTierListDialog } from "./dashboard/CreateTierListDialog";
import { Item, GroupWithItems } from "./dashboard/types";
import {
  createGroup,
  createTierList,
  deleteGroup,
  getUserContent,
  updateGroupPosition,
  updateTierListPosition,
} from "@/app/utils/supabase/server";

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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          const content = await getUserContent(session.user.id);

          const transformedItems: Item[] = [
            ...content.groups.map((group) => ({
              ...group,
              items: [],
              isGroup: true,
            })),
            ...content.tierLists.map((tierList) => ({
              ...tierList,
              creator: "You",
              likes: 0,
              views: 0,
              image: "/placeholder.svg?height=100&width=200",
            })),
          ];
          setItems(transformedItems);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setError("Failed to load content");
      }
    };

    fetchUserContent();
  }, []);

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
        const newTierList = await createTierList(userId, newTierListName);
        if (!newTierList) {
          throw new Error("Failed to create tier list");
        }
        setItems([
          ...items,
          {
            ...newTierList,
            creator: "You",
            likes: 0,
            views: 0,
            image: "/placeholder.svg?height=100&width=200",
          },
        ]);
        setNewTierListName("");
        setIsTierListDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error creating tier list:", error);
        setError("Failed to create tier list");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setItems((items) => {
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
          const currentGroup = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
          if (currentGroup) {
            updateTierListPosition(currentGroup, item.id, newIndex).catch((error) => {
              console.error("Error updating tier list position:", error);
              setError("Failed to update position");
            });
          }
        }

        return newItems;
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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

          <DashboardGrid
            items={getCurrentItems()}
            selectedItem={selectedItem}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onDeleteGroup={handleDeleteItem}
          />

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
    </DndContext>
  );
}
