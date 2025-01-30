"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, X } from "lucide-react";
import { GroupWithItems } from "./types";

interface GroupCardProps {
  group: GroupWithItems;
  isSelected: boolean;
  onDelete: () => void;
}

export function GroupCard({ group, isSelected, onDelete }: GroupCardProps) {
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
