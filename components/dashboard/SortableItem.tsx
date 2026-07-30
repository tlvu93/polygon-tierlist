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
  // `disabled` used to also check a `data-draggable="false"` attribute via a
  // direct `document.querySelector` call evaluated on every render. Nothing
  // in the codebase ever sets that attribute, so the check was always
  // false and did nothing but perform an unnecessary DOM query during
  // render (and risk crashing in any future SSR path where `document`
  // isn't defined). Removed as dead code; `isMobile` is the only real
  // condition that disables dragging here.
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    disabled: isMobile,
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

  // `attributes` from useSortable already gives this element role="button",
  // aria-roledescription, aria-disabled and tabIndex=0, and `listeners`
  // wires up dnd-kit's KeyboardSensor (Space to pick up / drop, arrow keys
  // to move, Escape to cancel) so reordering has a full keyboard
  // alternative out of the box. Space is consumed by dnd-kit for
  // pickup/drop, but nothing wires up "open" for keyboard users — only
  // onClick/onDoubleClick (mouse) and onTouchEnd (touch) did. Enter is not
  // used by dnd-kit's sensor, so we use it here to open/navigate into the
  // focused item, keeping keyboard users at parity with mouse users.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onDoubleClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        handleKeyDown(e);
      }}
      className="relative"
      data-id={id}
    >
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
