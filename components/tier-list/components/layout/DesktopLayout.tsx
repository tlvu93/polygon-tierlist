"use client";

import { ResizableSidebar } from "./ResizableSidebar";
import { MainContentProps } from "../../types/layout.types";
import MainContent from "../content/MainContent";
import PolyListList from "../polylist/PolyListList";
import Sidebar from "../../Sidebar";

interface DesktopLayoutProps {
  mainContentProps: MainContentProps;
  leftSidebarProps: {
    width: number;
    collapsed: boolean;
    onToggleCollapse: () => void;
    onWidthChange: (width: number) => void;
  };
  rightSidebarProps: {
    width: number;
    collapsed: boolean;
    onToggleCollapse: () => void;
    onWidthChange: (width: number) => void;
  };
  polyListListProps: {
    polyLists: any[];
    currentPolyListId: string;
    onPolyListSelect: (id: string) => void;
    onAddPolyList: () => void;
  };
  sidebarProps: {
    onStatCountChange: (count: number) => void;
  };
}

export function DesktopLayout({
  mainContentProps,
  leftSidebarProps,
  rightSidebarProps,
  polyListListProps,
  sidebarProps,
}: DesktopLayoutProps) {
  const minSidebarWidth = 160;
  const maxSidebarWidth = 400;

  return (
    <div className="hidden lg:flex flex-1">
      {/* Left Sidebar */}
      <ResizableSidebar
        side="left"
        defaultWidth={leftSidebarProps.width}
        minWidth={minSidebarWidth}
        maxWidth={maxSidebarWidth}
        isCollapsed={leftSidebarProps.collapsed}
        onToggleCollapse={leftSidebarProps.onToggleCollapse}
        onWidthChange={leftSidebarProps.onWidthChange}
      >
        <PolyListList {...polyListListProps} />
      </ResizableSidebar>

      {/* Center Column - Main Content */}
      <div className="flex-1">
        <MainContent {...mainContentProps} />
      </div>

      {/* Right Sidebar */}
      <ResizableSidebar
        side="right"
        defaultWidth={rightSidebarProps.width}
        minWidth={minSidebarWidth}
        maxWidth={maxSidebarWidth}
        isCollapsed={rightSidebarProps.collapsed}
        onToggleCollapse={rightSidebarProps.onToggleCollapse}
        onWidthChange={rightSidebarProps.onWidthChange}
      >
        <Sidebar {...sidebarProps} />
      </ResizableSidebar>
    </div>
  );
}
