import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

import { PolyList } from "@/components/tier-list/types";
import { EXPORT_FILENAMES } from "@/components/tier-list/constants";
import {
  copyToClipboard,
  exportToPNG,
  exportToCSV,
} from "@/components/tier-list/utils";

interface SharingTabProps {
  currentPolyList?: PolyList;
  polyLists: PolyList[];
}

export function SharingTab({ currentPolyList, polyLists }: SharingTabProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const url = window.location.href;
    const result = await copyToClipboard(url);

    if (result.success) {
      toast({
        title: "Link copied",
        description: "The URL has been copied to your clipboard",
      });
    } else {
      toast({
        title: "Copy failed",
        description: result.error || "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleExportPNG = async () => {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      const filename = `${currentPolyList?.name || "polyList"}.png`;
      const result = await exportToPNG(mainContent as HTMLElement, filename);

      if (result.success) {
        toast({
          title: "Export successful",
          description: "The polyList has been exported as PNG",
        });
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Failed to export the polyList",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportCSV = () => {
    const result = exportToCSV(polyLists, EXPORT_FILENAMES.CSV);

    if (result.success) {
      toast({
        title: "Export successful",
        description: "The polyList has been exported as CSV",
      });
    } else {
      toast({
        title: "Export failed",
        description: result.error || "Failed to export as CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-3">
      <h3 className="text-lg font-semibold mb-3">Sharing & Export</h3>
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleCopyLink}
        >
          <Copy className="w-4 h-4" />
          Copy Link
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleExportPNG}
        >
          <Download className="w-4 h-4" />
          Export as PNG
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleExportCSV}
        >
          <Download className="w-4 h-4" />
          Export as CSV
        </Button>
      </div>
    </Card>
  );
}
