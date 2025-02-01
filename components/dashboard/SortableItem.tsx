"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useRef } from "react";
import { useIsMobile } from "@/components/ui/use-mobile";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function SortableItem({ id, children, onClick, onDoubleClick }: SortableItemProps) {
  const isMobile = useIsMobile();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled: isMobile || document.querySelector(`[data-id="${id}"]`)?.getAttribute("data-draggable") === "false",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const lastTap = useRef<number>(0);
  const DOUBLE_TAP_DELAY = 300;
  const isScrolling = useRef(false);

  const handleTouchStart = () => {
    isScrolling.current = false;
  };

  const handleTouchMove = () => {
    if (!isScrolling.current) {
      isScrolling.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();

    // If we were scrolling, reset state and don't handle tap
    if (isScrolling.current) {
      isScrolling.current = false;
      return;
    }

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap.current;

    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
      lastTap.current = 0;
      onDoubleClick();
    } else {
      lastTap.current = currentTime;
      // Remove setTimeout to make taps more responsive
      onClick();
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative" data-id={id}>
      <div
        className="h-full cursor-pointer md:cursor-move"
        onClick={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            onClick();
          }
        }}
        onDoubleClick={(e) => {
          if (!isMobile) {
            e.stopPropagation();
            onDoubleClick();
          }
        }}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
          ⋮
        </div>
        {children}
      </div>
    </div>
  );
}
