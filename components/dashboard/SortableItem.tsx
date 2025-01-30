"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function SortableItem({ id, children, onClick, onDoubleClick }: SortableItemProps) {
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
