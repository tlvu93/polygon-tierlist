"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, X } from "lucide-react";
import { GroupWithItems } from "./types";
import { useDroppable } from "@dnd-kit/core";

interface GroupCardProps {
  group: GroupWithItems;
  isSelected: boolean;
  onDelete: () => void;
}

export function GroupCard({ group, isSelected, onDelete }: GroupCardProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${group.id}`,
    data: { type: "group", id: group.id },
  });

  return (
    <Card
      ref={setDroppableRef}
      role="button"
      className={`group overflow-hidden border-2 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? "border-blue-500 shadow-blue-200" : "border-transparent hover:border-gray-200"
      } ${isOver ? "bg-blue-50 border-blue-200" : ""}`}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Folder className="w-6 h-6 mr-2 text-blue-500" />
          <h3 className="font-semibold text-lg">{group.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
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
