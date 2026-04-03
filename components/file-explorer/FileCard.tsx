import React from "react";
import { FileText, Trash2 } from "lucide-react";
import { FileItem } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onDelete: () => void;
  renderIcon?: (file: FileItem) => React.ReactNode;
  showFileSize?: boolean;
  showModifiedDate?: boolean;
}

export function FileCard({
  file,
  isSelected,
  onDelete,
  renderIcon,
  showFileSize = true,
  showModifiedDate = true,
}: FileCardProps) {
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const defaultIcon = <FileText className="h-8 w-8 text-blue-500" />;

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
              {renderIcon ? renderIcon(file) : defaultIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </h3>
              {showFileSize && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              )}
              {showModifiedDate && (
                <p className="text-xs text-gray-500">
                  Modified: {formatDate(file.modifiedAt)}
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
