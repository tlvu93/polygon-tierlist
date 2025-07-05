import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PolyList } from "../types";

interface SortingConfig {
  stat: number;
  weight: number;
}

interface SortingTabProps {
  statCount: number;
  currentPolyList?: PolyList;
  statNames: string[];
  sortingConfigs: SortingConfig[];
  isPending: boolean;
  onSortingChange: (configs: SortingConfig[]) => void;
}

export function SortingTab({
  statCount,
  currentPolyList,
  statNames,
  sortingConfigs,
  isPending,
  onSortingChange,
}: SortingTabProps) {
  const [localSortingConfigs, setLocalSortingConfigs] =
    useState<SortingConfig[]>(sortingConfigs);

  const handleConfigChange = (
    index: number,
    updates: Partial<SortingConfig>
  ) => {
    const newConfigs = [...localSortingConfigs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    setLocalSortingConfigs(newConfigs);
    onSortingChange(newConfigs);
  };

  const handleRemoveConfig = (index: number) => {
    const newConfigs = localSortingConfigs.filter((_, i) => i !== index);
    setLocalSortingConfigs(newConfigs);
    onSortingChange(newConfigs);
  };

  const handleAddConfig = () => {
    const newConfigs = [...localSortingConfigs, { stat: 0, weight: 1 }];
    setLocalSortingConfigs(newConfigs);
    onSortingChange(newConfigs);
  };

  return (
    <Card className="p-3">
      <h3 className="text-lg font-semibold mb-3">Sorting Configuration</h3>
      <div className="space-y-4">
        {localSortingConfigs.map((config, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <select
                className={`w-2/3 p-2 border rounded-md ${
                  isPending ? "text-slate-400" : ""
                }`}
                value={config.stat}
                onChange={(e) =>
                  handleConfigChange(index, { stat: parseInt(e.target.value) })
                }
              >
                {Array.from({ length: statCount }, (_, i) => (
                  <option key={i} value={i}>
                    {currentPolyList?.stats[i]?.name || statNames[i]}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveConfig(index)}
              >
                Remove
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-500">
                Weight: {config.weight.toFixed(1)}
              </label>
              <Slider
                value={[config.weight]}
                onValueChange={([value]) => {
                  requestAnimationFrame(() => {
                    handleConfigChange(index, { weight: value });
                  });
                }}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddConfig}
          disabled={localSortingConfigs.length >= statCount}
        >
          Add Stat
        </Button>
      </div>
    </Card>
  );
}
