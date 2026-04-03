"use client";

import React from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { FileCard } from "./FileCard";
import { FolderCard } from "./FolderCard";
import { ExplorerItem, FileItem, FolderItem } from "./types";

interface FileExplorerGridProps {
  items: ExplorerItem[];
  selectedItems: Set<string>;
  onItemClick: (item: ExplorerItem) => void;
  onItemDoubleClick: (item: ExplorerItem) => void;
  onDeleteItem: (id: string) => void;
  renderFileIcon?: (file: FileItem) => React.ReactNode;
  renderFolderIcon?: (folder: FolderItem) => React.ReactNode;
  showFileSize?: boolean;
  showModifiedDate?: boolean;
  emptyStateMessage?: string;
}

export function FileExplorerGrid({
  items,
  selectedItems,
  onItemClick,
  onItemDoubleClick,
  onDeleteItem,
  renderFileIcon,
  renderFolderIcon,
  showFileSize = true,
  showModifiedDate = true,
  emptyStateMessage = "No items found. Start by creating a new file or folder!",
}: FileExplorerGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyStateMessage}</p>
      </div>
    );
  }

  const renderItems = (items: ExplorerItem[]) => {
    return (
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem
            key={item.id}
            id={item.id}
            onClick={() => onItemClick(item)}
            onDoubleClick={() => onItemDoubleClick(item)}
          >
            {item.type === "folder" ? (
              <FolderCard
                folder={item as FolderItem}
                isSelected={selectedItems.has(item.id)}
                onDelete={() => onDeleteItem(item.id)}
                renderIcon={renderFolderIcon}
                showModifiedDate={showModifiedDate}
              />
            ) : (
              <FileCard
                file={item as FileItem}
                isSelected={selectedItems.has(item.id)}
                onDelete={() => onDeleteItem(item.id)}
                renderIcon={renderFileIcon}
                showFileSize={showFileSize}
                showModifiedDate={showModifiedDate}
              />
            )}
          </SortableItem>
        ))}
      </SortableContext>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {renderItems(items)}
    </div>
  );
}
