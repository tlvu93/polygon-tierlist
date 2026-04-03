import React from "react";
import { ChevronLeft, FileText, FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileExplorerHeaderProps {
  currentPath: string[];
  currentFolderName: string;
  onNavigateUp: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  canNavigateUp: boolean;
}

export function FileExplorerHeader({
  currentPath,
  currentFolderName,
  onNavigateUp,
  onCreateFile,
  onCreateFolder,
  canNavigateUp,
}: FileExplorerHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        {canNavigateUp && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateUp}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          {currentPath.length === 0 ? (
            <span className="font-medium text-gray-900">Root</span>
          ) : (
            <>
              <span className="text-gray-500">Root</span>
              {currentPath.map((_, index) => (
                <React.Fragment key={index}>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-500">
                    {index === currentPath.length - 1
                      ? currentFolderName
                      : "..."}
                  </span>
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="flex items-center space-x-1">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={onCreateFile}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>New File</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCreateFolder}
              className="flex items-center space-x-2"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
