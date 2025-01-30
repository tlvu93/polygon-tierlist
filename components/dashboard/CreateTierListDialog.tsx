import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateTierListDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newTierListName: string;
  onNameChange: (name: string) => void;
  onCreateTierList: () => void;
  isLoading: boolean;
}

export function CreateTierListDialog({
  isOpen,
  onOpenChange,
  newTierListName,
  onNameChange,
  onCreateTierList,
  isLoading,
}: CreateTierListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tier List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type="text"
            placeholder="Tier List name"
            value={newTierListName}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <Button onClick={onCreateTierList} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Tier List"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
