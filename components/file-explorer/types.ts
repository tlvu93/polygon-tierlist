// Core types for the file explorer component
export interface FileItem {
  id: string;
  name: string;
  type: "file";
  size?: number;
  modifiedAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  items: (FileItem | FolderItem)[];
  modifiedAt: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export type ExplorerItem = FileItem | FolderItem;

// Storage interface for persistence
export interface FileExplorerStorage {
  getItems: () => Promise<ExplorerItem[]>;
  createFile: (name: string, parentId?: string) => Promise<FileItem>;
  createFolder: (name: string, parentId?: string) => Promise<FolderItem>;
  deleteItem: (id: string) => Promise<boolean>;
  updateItem: (
    id: string,
    updates: Partial<ExplorerItem>
  ) => Promise<ExplorerItem | null>;
  moveItem: (itemId: string, targetFolderId?: string) => Promise<boolean>;
  reorderItems: (itemIds: string[], parentId?: string) => Promise<void>;
}

// Component props
export interface FileExplorerProps {
  storage: FileExplorerStorage;
  onFileClick?: (file: FileItem) => void;
  onFileDoubleClick?: (file: FileItem) => void;
  onFolderClick?: (folder: FolderItem) => void;
  onFolderDoubleClick?: (folder: FolderItem) => void;
  onItemDelete?: (item: ExplorerItem) => void;
  onItemRename?: (item: ExplorerItem, newName: string) => void;
  renderFileIcon?: (file: FileItem) => React.ReactNode;
  renderFolderIcon?: (folder: FolderItem) => React.ReactNode;
  className?: string;
  emptyStateMessage?: string;
  allowDragAndDrop?: boolean;
  allowMultiSelect?: boolean;
  showFileSize?: boolean;
  showModifiedDate?: boolean;
}

// Internal state types
export interface FileExplorerState {
  items: ExplorerItem[];
  currentPath: string[];
  selectedItems: Set<string>;
  draggedItem: string | null;
  isLoading: boolean;
  error: string | null;
}

// Event handlers
export interface FileExplorerEvents {
  onItemClick: (item: ExplorerItem) => void;
  onItemDoubleClick: (item: ExplorerItem) => void;
  onItemSelect: (itemId: string, selected: boolean) => void;
  onDragStart: (itemId: string) => void;
  onDragEnd: (itemId: string, targetId?: string) => void;
  onNavigateUp: () => void;
  onNavigateToFolder: (folderId: string) => void;
}
