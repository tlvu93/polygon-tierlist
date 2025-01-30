import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, BarChart, Folder } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  currentPath: string[];
  onNavigateUp: () => void;
  onOpenTierListDialog: () => void;
  onOpenGroupDialog: () => void;
}

export function DashboardHeader({
  currentPath,
  onNavigateUp,
  onOpenTierListDialog,
  onOpenGroupDialog,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        {currentPath.length > 0 ? (
          <Button variant="ghost" onClick={onNavigateUp} className="flex items-center space-x-2">
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span>Back to Dashboard</span>
          </Button>
        ) : (
          <h1 className="text-2xl font-bold">Dashboard</h1>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create new
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onOpenTierListDialog}>
            <BarChart className="w-4 h-4 mr-2" />
            Tier List
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenGroupDialog}>
            <Folder className="w-4 h-4 mr-2" />
            Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
