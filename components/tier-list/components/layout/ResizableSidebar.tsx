"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDragHandlers } from "../../hooks/useDragHandlers";
import { ResizableSidebarProps } from "../../types/layout.types";

export function ResizableSidebar({
  children,
  side,
  defaultWidth,
  minWidth,
  maxWidth,
  isCollapsed,
  onToggleCollapse,
  onWidthChange,
}: ResizableSidebarProps) {
  const { handleDragStart, handleRightDragStart } = useDragHandlers({
    minWidth,
    maxWidth,
    onWidthChange,
  });

  const isLeft = side === "left";
  const dragHandler = isLeft ? handleDragStart : handleRightDragStart;
  const ChevronIcon = isLeft
    ? isCollapsed
      ? ChevronRight
      : ChevronLeft
    : isCollapsed
    ? ChevronLeft
    : ChevronRight;

  return (
    <div
      style={{
        width: isCollapsed ? 24 : defaultWidth,
        minWidth: isCollapsed ? 24 : minWidth,
        maxWidth: isCollapsed ? 24 : maxWidth,
        transition: "width 0.2s cubic-bezier(.4,1.2,.6,1)",
        position: "relative",
        zIndex: 10,
      }}
      className={`border-r bg-white flex flex-col h-full relative ${
        isLeft ? "border-r" : "border-l"
      }`}
    >
      {!isCollapsed && children}

      <button
        className={`absolute top-1/2 z-20 bg-white border border-slate-200 rounded-full shadow p-1 hover:bg-slate-100 focus:outline-none ${
          isLeft
            ? "right-0 -translate-y-1/2 translate-x-1/2"
            : "left-0 -translate-y-1/2 -translate-x-1/2"
        }`}
        style={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronIcon size={16} />
      </button>

      {!isCollapsed && (
        <div
          onMouseDown={dragHandler}
          className={`absolute top-0 h-full w-2 cursor-ew-resize z-30 ${
            isLeft ? "right-0" : "left-0"
          }`}
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}
