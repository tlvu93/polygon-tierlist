"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PanelRight } from "lucide-react";
import { MainContentProps } from "../../types/layout.types";
import MainContent from "../content/MainContent";

interface MobileLayoutProps {
  mainContentProps: MainContentProps;
  sidebarContent: React.ReactNode;
  isSheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function MobileLayout({
  mainContentProps,
  sidebarContent,
  isSheetOpen,
  onSheetOpenChange,
}: MobileLayoutProps) {
  return (
    <div className="lg:hidden flex flex-col flex-1">
      <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed right-1 top-16 z-50"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] sm:w-[450px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <MainContent {...mainContentProps} />
      </div>
    </div>
  );
}
