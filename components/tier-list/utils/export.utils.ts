import html2canvas from "html2canvas";
import { PolyList } from "../types";

export const exportToPNG = async (
  element: HTMLElement,
  filename: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
    });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to export as PNG" };
  }
};

export const exportToCSV = (
  polyLists: PolyList[],
  filename: string = "polygon-tier-list.csv"
): { success: boolean; error?: string } => {
  try {
    if (!polyLists.length) {
      return { success: false, error: "No data to export" };
    }

    // Get all unique stat names from all polyLists
    const allStatNames = new Set<string>();
    polyLists.forEach((polyList) => {
      polyList.stats.forEach((stat) => {
        allStatNames.add(stat.name);
      });
    });

    // Create headers
    const headers = ["Name", ...Array.from(allStatNames)];

    // Create rows for each polyList
    const rows = polyLists.map((polyList) => {
      const values = [polyList.name];
      Array.from(allStatNames).forEach((statName) => {
        const stat = polyList.stats.find((s) => s.name === statName);
        values.push(stat ? stat.value.toString() : "");
      });
      return values;
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch {
    return { success: false, error: "Failed to export as CSV" };
  }
};

export const copyToClipboard = async (
  text: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to copy to clipboard" };
  }
};
