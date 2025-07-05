export interface SidebarState {
  isCollapsed: boolean;
  width: number;
}

export interface LayoutProps {
  tierListName?: string;
  id?: string;
}

export interface TierListLayoutProps extends LayoutProps {
  tierListName?: string;
  id?: string;
}

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

export interface MobileLayoutProps extends LayoutProps {
  isSheetOpen: boolean;
  onSheetToggle: (open: boolean) => void;
}
