import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { MinusCircle, PlusCircle, Lock, Unlock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMemo, useCallback } from "react";

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
  // Memoize stat items to prevent unnecessary re-renders
  const statItems = useMemo(() => {
    return Array.from({ length: statCount }, (_, i) => {
      const statValue = localStatValues[i];
      // Ensure we have a valid number, default to 5 if undefined/NaN
      const safeValue =
        typeof statValue === "number" && !isNaN(statValue) ? statValue : 5;
      const statName = localStatNames[i] || `Stat ${i + 1}`;

      return {
        index: i,
        value: safeValue,
        name: statName,
        // Create a stable array reference for the Slider value
        sliderValue: [safeValue],
      };
    });
  }, [statCount, localStatValues, localStatNames]);

  // Memoize the value change handler to prevent recreating on every render
  const handleValueChange = useCallback(
    (index: number) => {
      return ([value]: number[]) => {
        if (isDraggable && typeof value === "number" && !isNaN(value)) {
          // Use setTimeout instead of requestAnimationFrame to prevent sync updates
          setTimeout(() => {
            onStatValueChange(index, value);
          }, 0);
        }
      };
    },
    [isDraggable, onStatValueChange]
  );

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
            {statItems.map((stat) => {
              const isSelected = selectedStatIndex === stat.index;
              return (
                <div
                  key={`stat-${stat.index}`}
                  className={`border-2 rounded-lg p-2 transition-all duration-200 ${
                    isSelected
                      ? "border-orange-400 bg-orange-50/50"
                      : "border-transparent"
                  }`}
                >
                  <div className="mb-1 cursor-pointer hover:bg-slate-100 transition-colors py-1 px-1">
                    <input
                      type="text"
                      value={stat.name}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        onStatNameChange(stat.index, newValue);
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
                      Value: {stat.value.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    key={`slider-${stat.index}-${stat.value}`}
                    value={stat.sliderValue}
                    onValueChange={handleValueChange(stat.index)}
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
