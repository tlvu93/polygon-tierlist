import React from "react";
import { FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "file" | "folder";
  itemName: string;
  onNameChange: (name: string) => void;
  onCreateItem: () => void;
  isLoading: boolean;
}

export function CreateItemDialog({
  isOpen,
  onOpenChange,
  itemType,
  itemName,
  onNameChange,
  onCreateItem,
  isLoading,
}: CreateItemDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onCreateItem();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && itemName.trim()) {
      onCreateItem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {itemType === "file" ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-yellow-500" />
            )}
            <span>Create New {itemType === "file" ? "File" : "Folder"}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">
              {itemType === "file" ? "File" : "Folder"} Name
            </Label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${itemType} name...`}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!itemName.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
