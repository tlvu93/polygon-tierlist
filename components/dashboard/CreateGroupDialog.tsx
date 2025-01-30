import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newGroupName: string;
  onNameChange: (name: string) => void;
  onCreateGroup: () => void;
  isLoading: boolean;
}

export function CreateGroupDialog({
  isOpen,
  onOpenChange,
  newGroupName,
  onNameChange,
  onCreateGroup,
  isLoading,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Button onClick={onCreateGroup} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
