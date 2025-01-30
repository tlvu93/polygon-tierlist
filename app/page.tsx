"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Header from "@/components/Header"
import { BarChart, Heart, User, Plus, X, Folder } from "lucide-react"

interface TierList {
  id: number
  name: string
  creator: string
  likes: number
  views: number
  image: string
}

interface Group {
  id: string
  name: string
  items: (TierList | Group)[]
  isGroup: true
}

type Item = TierList | Group

const initialTierLists: TierList[] = [
  {
    id: 1,
    name: "Headphone Comparison",
    creator: "AudioPhile",
    likes: 245,
    views: 1200,
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 2,
    name: "Smartphone Rankings",
    creator: "TechGuru",
    likes: 189,
    views: 980,
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 3,
    name: "Best Video Games 2023",
    creator: "GameMaster",
    likes: 302,
    views: 1500,
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 4,
    name: "Top Movies of All Time",
    creator: "CinemaFan",
    likes: 567,
    views: 2300,
    image: "/placeholder.svg?height=100&width=200",
  },
]

export default function Home() {
  const [items, setItems] = useState<Item[]>(initialTierLists)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<string[]>([])

  const router = useRouter()

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        items: [],
        isGroup: true,
      }
      setItems([...items, newGroup])
      setNewGroupName("")
    }
  }

  const handleDeleteItem = (itemId: string) => {
    const deleteRecursively = (items: Item[]): Item[] => {
      return items.filter((item) => {
        if ("isGroup" in item && item.id === itemId) {
          return false
        }
        if ("isGroup" in item) {
          item.items = deleteRecursively(item.items)
        }
        return true
      })
    }
    setItems(deleteRecursively(items))
  }

  const onDragEnd = (result: any) => {
    const { source, destination } = result
    if (!destination) return

    const reorder = (list: Item[], startIndex: number, endIndex: number) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    const findItemById = (items: Item[], id: string): [Item | null, Item[]] => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          return [items[i], items]
        }
        if ("isGroup" in items[i]) {
          const [found, parentItems] = findItemById(items[i].items, id)
          if (found) {
            return [found, parentItems]
          }
        }
      }
      return [null, []]
    }

    const [sourceParent, sourceItems] =
      source.droppableId === "root" ? [null, items] : findItemById(items, source.droppableId)

    const [destParent, destItems] =
      destination.droppableId === "root" ? [null, items] : findItemById(items, destination.droppableId)

    if (source.droppableId === destination.droppableId) {
      const reorderedItems = reorder(sourceItems, source.index, destination.index)
      if (source.droppableId === "root") {
        setItems(reorderedItems)
      } else if (sourceParent && "isGroup" in sourceParent) {
        sourceParent.items = reorderedItems
        setItems([...items])
      }
    } else {
      const [movedItem] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, movedItem)

      if (sourceParent && "isGroup" in sourceParent) {
        sourceParent.items = sourceItems
      }
      if (destParent && "isGroup" in destParent) {
        destParent.items = destItems
      }

      setItems([...items])
    }
  }

  const handleItemClick = (item: Item) => {
    setSelectedItem(selectedItem === item.id ? null : item.id)
  }

  const handleItemDoubleClick = (item: Item) => {
    if ("isGroup" in item) {
      setCurrentPath([...currentPath, item.id])
    } else {
      router.push(`/tier-list/${item.id}`)
    }
  }

  const getCurrentItems = (): Item[] => {
    let currentItems = items
    for (const groupId of currentPath) {
      const group = currentItems.find((item) => "isGroup" in item && item.id === groupId) as Group
      if (group) {
        currentItems = group.items
      } else {
        break
      }
    }
    return currentItems
  }

  const navigateUp = () => {
    setCurrentPath(currentPath.slice(0, -1))
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {currentPath.length > 0 && (
                <Button variant="ghost" onClick={navigateUp}>
                  Up
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="New group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-48"
              />
              <Button onClick={handleCreateGroup} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
          <Droppable
            droppableId={currentPath.length === 0 ? "root" : currentPath[currentPath.length - 1]}
            direction="horizontal"
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {getCurrentItems().map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        {"isGroup" in item ? (
                          <GroupCard
                            group={item}
                            isSelected={selectedItem === item.id}
                            onClick={() => handleItemClick(item)}
                            onDoubleClick={() => handleItemDoubleClick(item)}
                            onDelete={() => handleDeleteItem(item.id)}
                          />
                        ) : (
                          <TierListCard
                            tierList={item}
                            isSelected={selectedItem === item.id}
                            onClick={() => handleItemClick(item)}
                            onDoubleClick={() => handleItemDoubleClick(item)}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </main>
      </div>
    </DragDropContext>
  )
}

interface GroupCardProps {
  group: Group
  isSelected: boolean
  onClick: () => void
  onDoubleClick: () => void
  onDelete: () => void
}

function GroupCard({ group, isSelected, onClick, onDoubleClick, onDelete }: GroupCardProps) {
  return (
    <Card
      className={`overflow-hidden border-2 shadow-md cursor-move transition-all duration-200 ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent"
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Folder className="w-6 h-6 mr-2 text-blue-500" />
          <h3 className="font-semibold text-lg">{group.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardContent>
      <CardFooter className="bg-white p-4 flex justify-between items-center border-t">
        <div className="text-sm text-gray-500">
          {group.items.length} item{group.items.length !== 1 ? "s" : ""}
        </div>
      </CardFooter>
    </Card>
  )
}

interface TierListCardProps {
  tierList: TierList
  isSelected: boolean
  onClick: () => void
  onDoubleClick: () => void
}

function TierListCard({ tierList, isSelected, onClick, onDoubleClick }: TierListCardProps) {
  return (
    <Card
      className={`overflow-hidden border-2 shadow-md cursor-move transition-all duration-200 ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent"
      }`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <img src={tierList.image || "/placeholder.svg"} alt={tierList.name} className="w-full h-40 object-cover" />
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{tierList.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <User className="w-4 h-4 mr-1" />
          {tierList.creator}
        </div>
      </CardContent>
      <CardFooter className="bg-white p-4 flex justify-between items-center border-t">
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
  )
}

