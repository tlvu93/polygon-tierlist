import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EditorTabProps {
  statCount: number;
  localStatNames: string[];
  localStatValues: number[];
  isPending: boolean;
  isDraggable?: boolean;
  onDraggableToggle?: (enabled: boolean) => void;
  onStatCountChange: (increment: boolean) => void;
  onStatNameChange: (index: number, name: string) => void;
  onStatValueChange: (index: number, value: number) => void;
}

export function EditorTab({
  statCount,
  localStatNames,
  localStatValues,
  isPending,
  isDraggable = false,
  onDraggableToggle,
  onStatCountChange,
  onStatNameChange,
  onStatValueChange,
}: EditorTabProps) {
  return (
    <Card className="p-3">
      <div className="space-y-6">
        {/* General Settings Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3">
            General Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm mb-1 block">Stats</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStatCountChange(false)}
                  disabled={statCount <= 3}
                >
                  <MinusCircle className="w-4 h-4" />
                </Button>
                <span className="min-w-[4rem] text-center">
                  {statCount} stats
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStatCountChange(true)}
                  disabled={statCount >= 8}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {onDraggableToggle && (
              <div>
                <label className="text-sm mb-1 block">Interaction</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="draggable-toggle"
                    checked={isDraggable}
                    onChange={(e) => onDraggableToggle(e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <label
                    htmlFor="draggable-toggle"
                    className="text-sm text-gray-700"
                  >
                    Draggable Stats
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Stats Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3">Stats</h3>
          <div className="space-y-4">
            {Array.from({ length: statCount }, (_, i) => (
              <div key={i}>
                <div className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1">
                  <input
                    type="text"
                    value={localStatNames[i] || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      onStatNameChange(i, newValue);
                    }}
                    className={`w-full bg-transparent border-0 outline-none border-b border-solid border-slate-200 hover:border-slate-400 focus:border-slate-400 px-1 ${
                      isPending ? "text-slate-400" : ""
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">
                    Value: {localStatValues[i]?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <Slider
                  value={[localStatValues[i] || 0]}
                  onValueChange={([value]) => {
                    requestAnimationFrame(() => {
                      onStatValueChange(i, value);
                    });
                  }}
                  max={10}
                  step={0.1}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
