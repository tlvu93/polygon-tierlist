import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { PolyList, Stat } from "../../../types";

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

  // Track if we're updating from external changes to prevent loops
  const isUpdatingFromProps = useRef(false);

  // Track the last polyList ID to detect actual changes
  const lastPolyListId = useRef<string | undefined>(currentPolyList?.id);

  // Update local state when current polyList changes
  useEffect(() => {
    if (currentPolyList && currentPolyList.id !== lastPolyListId.current) {
      // Only update if it's actually a different polyList
      isUpdatingFromProps.current = true;
      lastPolyListId.current = currentPolyList.id;

      setLocalStatNames(currentPolyList.stats.map((p) => p.name));
      setLocalStatValues(
        Array.from(
          { length: statCount },
          (_, i) => currentPolyList.stats[i]?.value ?? 5
        )
      );

      // Reset the flag after a small delay to allow state to settle
      setTimeout(() => {
        isUpdatingFromProps.current = false;
      }, 100);
    }
  }, [currentPolyList?.id, statCount]); // Only depend on ID and statCount

  const debouncedStatNameChange = useDebounce(
    useCallback(
      (index: number, name: string) => {
        if (!isUpdatingFromProps.current) {
          startTransition(() => {
            onStatChange(index, { name });
          });
        }
      },
      [onStatChange]
    ),
    1000
  );

  const debouncedStatValueChange = useDebounce(
    useCallback(
      (index: number, value: number) => {
        if (!isUpdatingFromProps.current) {
          startTransition(() => {
            onStatChange(index, { value });
          });
        }
      },
      [onStatChange]
    ),
    150
  );

  const debouncedSortingChange = useDebounce(
    useCallback(
      (configs: SortingConfig[]) => {
        if (!isUpdatingFromProps.current) {
          startTransition(() => {
            onSortingChange(configs);
          });
        }
      },
      [onSortingChange]
    ),
    150
  );

  const handleStatCountChange = useCallback(
    (increment: boolean) => {
      const newCount = increment ? statCount + 1 : statCount - 1;
      onStatCountChange(Math.min(Math.max(newCount, 3), 8)); // Clamp between 3 and 8
    },
    [statCount, onStatCountChange]
  );

  // Custom handlers that update local state immediately
  const handleLocalStatNameChange = useCallback(
    (index: number, name: string) => {
      setLocalStatNames((prev) => {
        const newNames = [...prev];
        newNames[index] = name;
        return newNames;
      });
      debouncedStatNameChange(index, name);
    },
    [debouncedStatNameChange]
  );

  const handleLocalStatValueChange = useCallback(
    (index: number, value: number) => {
      setLocalStatValues((prev) => {
        const newValues = [...prev];
        newValues[index] = value;
        return newValues;
      });
      debouncedStatValueChange(index, value);
    },
    [debouncedStatValueChange]
  );

  return {
    localStatNames,
    localStatValues,
    sortingConfigs,
    setSortingConfigs,
    isPending,
    debouncedStatNameChange: handleLocalStatNameChange,
    debouncedStatValueChange: handleLocalStatValueChange,
    debouncedSortingChange,
    handleStatCountChange,
  };
}
