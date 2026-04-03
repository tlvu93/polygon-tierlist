// Main component
export { FileExplorer } from "./FileExplorer";

// Supporting components
export { FileExplorerHeader } from "./FileExplorerHeader";
export { FileExplorerGrid } from "./FileExplorerGrid";
export { FileCard } from "./FileCard";
export { FolderCard } from "./FolderCard";
export { SortableItem } from "./SortableItem";
export { CreateItemDialog } from "./CreateItemDialog";

// Types
export type {
  FileItem,
  FolderItem,
  ExplorerItem,
  FileExplorerStorage,
  FileExplorerProps,
  FileExplorerState,
  FileExplorerEvents,
} from "./types";

// Storage adapters
export { LocalStorageFileExplorer } from "./storage/localStorageAdapter";
