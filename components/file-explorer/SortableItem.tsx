"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export function SortableItem({
  id,
  children,
  onClick,
  onDoubleClick,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // `attributes`/`listeners` from useSortable already provide a keyboard
  // alternative for reordering (Space to pick up/drop, arrow keys to move,
  // Escape to cancel) plus role="button" and tabIndex. Space is consumed
  // by dnd-kit, so Enter is free to use here as the keyboard equivalent of
  // onDoubleClick (open), keeping keyboard users at parity with mouse
  // users who can double-click.
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === "Enter") {
          e.preventDefault();
          onDoubleClick?.();
        }
      }}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
}
