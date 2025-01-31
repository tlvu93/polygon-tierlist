"use client";

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Item } from "@/components/dashboard/types";
import { SortableItem } from "@/components/dashboard/SortableItem";
import { GroupCard } from "@/components/dashboard/GroupCard";
import { TierListCard } from "@/components/dashboard/TierListCard";
import React from "react";

interface DashboardGridProps {
  items: Item[];
  selectedItem: string | null;
  onItemClick: (item: Item) => void;
  onItemDoubleClick: (item: Item) => void;
  onDeleteGroup: (id: string) => void;
  onDeleteTierList: (id: string) => void;
}

export function DashboardGrid({
  items,
  selectedItem,
  onItemClick,
  onItemDoubleClick,
  onDeleteGroup,
  onDeleteTierList,
}: DashboardGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No items found. Start by creating a new Tier List or Group!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        {items.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            onClick={() => onItemClick(item)}
            onDoubleClick={() => onItemDoubleClick(item)}
          >
            {"isGroup" in item ? (
              <GroupCard group={item} isSelected={selectedItem === item.id} onDelete={() => onDeleteGroup(item.id)} />
            ) : (
              <TierListCard
                tierList={item}
                isSelected={selectedItem === item.id}
                onDelete={() => onDeleteTierList(item.id)}
              />
            )}
          </SortableItem>
        ))}
      </SortableContext>
    </div>
  );
}
