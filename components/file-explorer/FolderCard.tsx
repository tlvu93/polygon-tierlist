import React from "react";
import { Folder, Trash2 } from "lucide-react";
import { FolderItem } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FolderCardProps {
  folder: FolderItem;
  isSelected: boolean;
  onDelete: () => void;
  renderIcon?: (folder: FolderItem) => React.ReactNode;
  showModifiedDate?: boolean;
}

export function FolderCard({
  folder,
  isSelected,
  onDelete,
  renderIcon,
  showModifiedDate = true,
}: FolderCardProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getItemCount = (folder: FolderItem): number => {
    let count = 0;
    for (const item of folder.items) {
      count++;
      if (item.type === "folder") {
        count += getItemCount(item);
      }
    }
    return count;
  };

  const defaultIcon = <Folder className="h-8 w-8 text-yellow-500" />;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {renderIcon ? renderIcon(folder) : defaultIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {folder.name}
              </h3>
              <p className="text-xs text-gray-500">
                {getItemCount(folder)} items
              </p>
              {showModifiedDate && (
                <p className="text-xs text-gray-500">
                  Modified: {formatDate(folder.modifiedAt)}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
