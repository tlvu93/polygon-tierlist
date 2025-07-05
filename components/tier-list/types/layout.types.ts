import { PolyList, PolyListStat } from "../types";

// Layout component props
export interface TierListLayoutProps {
  tierListName?: string;
  id?: string;
}

export interface LocalTierListLayoutProps {
  tierListName?: string;
  id?: string;
}

// Sorting configuration
export interface SortingConfig {
  stat: number;
  weight: number;
}

// Sidebar configuration
export interface SidebarConfig {
  width: number;
  collapsed: boolean;
  minWidth: number;
  maxWidth: number;
}

// Resizable sidebar props
export interface ResizableSidebarProps {
  children: React.ReactNode;
  side: "left" | "right";
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onWidthChange: (width: number) => void;
}

// Main content props
export interface MainContentProps {
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onPolyListDelete?: (id: string) => void;
  onPolyListNameChange?: (id: string, name: string) => void;
  showPolyListList?: boolean;
  sortedPolyLists?: PolyList[];
  onAddPolyList?: () => void;
}

// PolyList list props
export interface PolyListListProps {
  polyLists: PolyList[];
  currentPolyListId: string;
  onPolyListSelect: (id: string) => void;
  onAddPolyList: () => void;
}

// Sidebar props
export interface SidebarProps {
  onStatCountChange: (count: number) => void;
  onDraggableToggle?: (draggable: boolean) => void;
}

// Header props
export interface HeaderProps {
  tierListName: string;
  onTierListNameChange: (name: string) => void;
}

// Drag handlers
export interface DragHandlers {
  onDragStart: (e: React.MouseEvent) => void;
  onDragMove: (e: MouseEvent) => void;
  onDragEnd: () => void;
}

// Layout state
export interface LayoutState {
  leftSidebar: SidebarConfig;
  rightSidebar: SidebarConfig;
  isSheetOpen: boolean;
  isDraggable: boolean;
}

// Data operations
export interface DataOperations {
  loadPolyLists: () => Promise<void>;
  handleStatChange: (
    index: number,
    change: Partial<PolyListStat>
  ) => Promise<void>;
  handleStatCountChange: (newCount: number) => Promise<void>;
  handleAddPolyList: () => Promise<void>;
  handlePolyListDelete: (polyListId: string) => Promise<void>;
  handlePolyListNameChange: (polyListId: string, name: string) => Promise<void>;
  handleTierListNameChange: (newName: string) => Promise<void>;
}
