"use client";

import { useState, useEffect } from "react";
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
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/app/components/Header";
import { BarChart, Heart, User, Plus, X, Folder, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  createGroup,
  createTierList,
  deleteGroup,
  getUserContent,
  updateGroupPosition,
  updateTierListPosition,
} from "@/app/utils/supabase/server";
import { Tables } from "@/types/supabase";

type TierListWithStats = Tables<"tier_lists"> & {
  creator?: string;
  likes?: number;
  views?: number;
  image?: string;
};

type GroupWithItems = Tables<"groups"> & {
  items: Item[];
  isGroup: true;
};

type Item = TierListWithStats | GroupWithItems;

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

  // Fetch user content on mount
  useEffect(() => {
    const fetchUserContent = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          const content = await getUserContent(session.user.id);

          // Transform the data into the required format
          const transformedItems: Item[] = [
            ...content.groups.map(
              (group): GroupWithItems => ({
                ...group,
                items: [],
                isGroup: true,
              })
            ),
            ...content.tierLists.map(
              (tierList): TierListWithStats => ({
                ...tierList,
                creator: "You",
                likes: 0,
                views: 0,
                image: "/placeholder.svg?height=100&width=200",
              })
            ),
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
        router.refresh(); // Refresh the page to update the data
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

        // Update positions in database
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

  const handleItemDoubleClick = (item: Item) => {
    if ("isGroup" in item) {
      setCurrentPath([...currentPath, item.id]);
    } else {
      router.push(`/tier-list/${item.id}`);
    }
  };

  const getCurrentItems = (): Item[] => {
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
  };

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && selectedItem) {
      const selectedItemData = getCurrentItems().find((item) => item.id === selectedItem);
      if (selectedItemData) {
        handleItemDoubleClick(selectedItemData);
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, currentPath]); // Include dependencies used in handleKeyDown

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
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {currentPath.length > 0 && (
                <Button variant="ghost" onClick={navigateUp}>
                  Up
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create new
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsTierListDialogOpen(true)}>
                  <BarChart className="w-4 h-4 mr-2" />
                  Tier List
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsGroupDialogOpen(true)}>
                  <Folder className="w-4 h-4 mr-2" />
                  Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    type="text"
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTierListDialogOpen} onOpenChange={setIsTierListDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tier List</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    type="text"
                    placeholder="Tier List name"
                    value={newTierListName}
                    onChange={(e) => setNewTierListName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateTierList}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Tier List"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {getCurrentItems().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found. Start by creating a new Tier List or Group!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <SortableContext
                items={getCurrentItems().map((item) => item.id)}
                strategy={horizontalListSortingStrategy}
              >
                {getCurrentItems().map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    onClick={() => handleItemClick(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <div>
                      {"isGroup" in item ? (
                        <GroupCard
                          group={item}
                          isSelected={selectedItem === item.id}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      ) : (
                        <TierListCard tierList={item} isSelected={selectedItem === item.id} />
                      )}
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </div>
          )}
        </main>
      </div>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  onDoubleClick: () => void;
}

function SortableItem({ id, children, onClick, onDoubleClick }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className="h-full"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
      >
        <div
          {...listeners}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 opacity-0 hover:opacity-100 cursor-move flex items-center justify-center"
        >
          ⋮
        </div>
        {children}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  isSelected,
  onDelete,
}: {
  group: GroupWithItems;
  isSelected: boolean;
  onDelete: () => void;
}) {
  return (
    <Card
      role="button"
      className={`overflow-hidden border-2 shadow-md cursor-pointer transition-all duration-200 ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent"
      }`}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Folder className="w-6 h-6 mr-2 text-blue-500" />
          <h3 className="font-semibold text-lg">{group.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardContent>
      <CardFooter className="bg-white p-3 flex justify-between items-center border-t">
        <div className="text-sm text-gray-500">
          {group.items.length} item{group.items.length !== 1 ? "s" : ""}
        </div>
      </CardFooter>
    </Card>
  );
}

function TierListCard({ tierList, isSelected }: { tierList: TierListWithStats; isSelected: boolean }) {
  return (
    <Card
      role="button"
      className={`overflow-hidden border-2 shadow-md cursor-pointer transition-all duration-200 ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent"
      }`}
    >
      <img src={tierList.image || "/placeholder.svg"} alt={tierList.title} className="w-full h-32 object-cover" />
      <CardContent className="p-3">
        <h3 className="font-semibold text-lg mb-1">{tierList.title}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <User className="w-4 h-4 mr-1" />
          {tierList.creator}
        </div>
      </CardContent>
      <CardFooter className="bg-white p-3 flex justify-between items-center border-t">
        <div className="flex space-x-3 text-sm text-gray-500">
          <span className="flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {tierList.likes}
          </span>
          <span className="flex items-center">
            <BarChart className="w-4 h-4 mr-1" />
            {tierList.views}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
