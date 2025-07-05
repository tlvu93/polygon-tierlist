import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MinusCircle, PlusCircle, Lock, Unlock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EditorTabProps {
  statCount: number;
  localStatNames: string[];
  localStatValues: number[];
  isPending: boolean;
  selectedStatIndex?: number | null;
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
  selectedStatIndex,
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
            {onDraggableToggle && (
              <div>
                <label className="text-sm mb-1 block">Interaction</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDraggableToggle(!isDraggable)}
                  className="flex items-center gap-2"
                >
                  {isDraggable ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>
                    {isDraggable ? "Lock Settings" : "Unlock Settings"}
                  </span>
                </Button>
              </div>
            )}
            <div>
              <label className="text-sm mb-1 block">Stats</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onStatCountChange(false)}
                  disabled={statCount <= 3 || !isDraggable}
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
                  disabled={statCount >= 8 || !isDraggable}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Stats Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3">Stats</h3>
          <div className="space-y-4">
            {Array.from({ length: statCount }, (_, i) => {
              const isSelected = selectedStatIndex === i;
              return (
                <div
                  key={i}
                  className={`border-2 rounded-lg p-2 transition-all duration-200 ${
                    isSelected
                      ? "border-orange-400 bg-orange-50/50"
                      : "border-transparent"
                  }`}
                >
                  <div className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1">
                    <input
                      type="text"
                      value={localStatNames[i] || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        onStatNameChange(i, newValue);
                      }}
                      disabled={!isDraggable}
                      className={`w-full bg-transparent border-0 outline-none border-b border-solid transition-colors px-1 ${
                        isPending ? "text-slate-400" : ""
                      } ${
                        !isDraggable ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        isSelected
                          ? "border-orange-400 font-medium text-orange-900"
                          : "border-slate-200 hover:border-slate-400 focus:border-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs transition-colors ${
                        isSelected
                          ? "text-orange-600 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      Value: {localStatValues[i]?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                  <Slider
                    value={[localStatValues[i] || 0]}
                    onValueChange={([value]) => {
                      if (isDraggable) {
                        requestAnimationFrame(() => {
                          onStatValueChange(i, value);
                        });
                      }
                    }}
                    max={10}
                    step={0.1}
                    disabled={!isDraggable}
                    className={
                      !isDraggable ? "opacity-50 cursor-not-allowed" : ""
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
