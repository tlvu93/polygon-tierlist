import { useState, useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { PolyList, Stat } from "../types";

interface SortingConfig {
  stat: number;
  weight: number;
}

interface UseSidebarStateProps {
  statCount: number;
  currentPolyList?: PolyList;
  onStatChange: (index: number, change: Partial<Stat>) => void;
  onSortingChange: (sortingConfigs: SortingConfig[]) => void;
  onStatCountChange: (count: number) => void;
}

export function useSidebarState({
  statCount,
  currentPolyList,
  onStatChange,
  onSortingChange,
  onStatCountChange,
}: UseSidebarStateProps) {
  const [isPending, startTransition] = useTransition();
  const [sortingConfigs, setSortingConfigs] = useState<SortingConfig[]>([]);
  const [localStatNames, setLocalStatNames] = useState<string[]>(
    currentPolyList?.stats.map((p) => p.name) || []
  );
  const [localStatValues, setLocalStatValues] = useState<number[]>(
    Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.value ?? 5
    )
  );

  // Update local state when current polyList changes
  useEffect(() => {
    if (currentPolyList) {
      setLocalStatNames(currentPolyList.stats.map((p) => p.name));
      setLocalStatValues(
        Array.from(
          { length: statCount },
          (_, i) => currentPolyList.stats[i]?.value ?? 5
        )
      );
    }
  }, [currentPolyList, statCount]);

  const debouncedStatNameChange = useDebounce((index: number, name: string) => {
    startTransition(() => {
      onStatChange(index, { name });
    });
  }, 1000);

  const debouncedStatValueChange = useDebounce(
    (index: number, value: number) => {
      startTransition(() => {
        onStatChange(index, { value });
      });
    },
    150
  );

  const debouncedSortingChange = useDebounce((configs: SortingConfig[]) => {
    startTransition(() => {
      onSortingChange(configs);
    });
  }, 150);

  const handleStatCountChange = (increment: boolean) => {
    const newCount = increment ? statCount + 1 : statCount - 1;
    onStatCountChange(Math.min(Math.max(newCount, 3), 8)); // Clamp between 3 and 8
  };

  return {
    localStatNames,
    localStatValues,
    sortingConfigs,
    setSortingConfigs,
    isPending,
    debouncedStatNameChange,
    debouncedStatValueChange,
    debouncedSortingChange,
    handleStatCountChange,
  };
}
