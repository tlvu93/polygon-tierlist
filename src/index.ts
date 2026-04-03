// File Explorer Components
export { FileExplorer } from "./components/file-explorer/FileExplorer";
export { FileExplorerHeader } from "./components/file-explorer/FileExplorerHeader";
export { FileExplorerGrid } from "./components/file-explorer/FileExplorerGrid";
export { FileCard } from "./components/file-explorer/FileCard";
export { FolderCard } from "./components/file-explorer/FolderCard";
export { SortableItem } from "./components/file-explorer/SortableItem";
export { CreateItemDialog } from "./components/file-explorer/CreateItemDialog";

// UI Components
export { Button } from "./components/ui/button";
export { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";

// Types
export type {
  FileItem,
  FolderItem,
  ExplorerItem,
  FileExplorerStorage,
  FileExplorerProps,
  FileExplorerState,
  FileExplorerEvents,
} from "./components/file-explorer/types";

// Storage adapters
export { LocalStorageFileExplorer } from "./components/file-explorer/storage/localStorageAdapter";
