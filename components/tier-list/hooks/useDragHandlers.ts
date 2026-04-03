import { useCallback } from "react";

interface UseDragHandlersProps {
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}

export function useDragHandlers({
  minWidth,
  maxWidth,
  onWidthChange,
}: UseDragHandlersProps) {
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.min(
          Math.max(minWidth + deltaX, minWidth),
          maxWidth
        );
        onWidthChange(newWidth);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [minWidth, maxWidth, onWidthChange]
  );

  const handleRightDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = startX - moveEvent.clientX;
        const newWidth = Math.min(
          Math.max(minWidth + deltaX, minWidth),
          maxWidth
        );
        onWidthChange(newWidth);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [minWidth, maxWidth, onWidthChange]
  );

  return {
    handleDragStart,
    handleRightDragStart,
  };
}
