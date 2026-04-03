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
    Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.name ?? `Stat ${i + 1}`
    )
  );
  const [localStatValues, setLocalStatValues] = useState<number[]>(
    Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.value ?? 5
    )
  );

  const pendingStatNames = useRef<Record<number, string>>({});
  const pendingStatValues = useRef<Record<number, number>>({});
  const lastPolyListId = useRef<string | undefined>(currentPolyList?.id);

  useEffect(() => {
    const nextStatNames = Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.name ?? `Stat ${i + 1}`
    );
    const nextStatValues = Array.from(
      { length: statCount },
      (_, i) => currentPolyList?.stats[i]?.value ?? 5
    );
    const hasSwitchedPolyList = currentPolyList?.id !== lastPolyListId.current;

    if (hasSwitchedPolyList) {
      lastPolyListId.current = currentPolyList?.id;
      pendingStatNames.current = {};
      pendingStatValues.current = {};
      setLocalStatNames(nextStatNames);
      setLocalStatValues(nextStatValues);
      return;
    }

    setLocalStatNames((prev) =>
      nextStatNames.map((name, index) => {
        const pendingName = pendingStatNames.current[index];

        if (pendingName === undefined) {
          return name;
        }

        if (name === pendingName) {
          delete pendingStatNames.current[index];
          return name;
        }

        return prev[index] ?? pendingName;
      })
    );

    setLocalStatValues((prev) =>
      nextStatValues.map((value, index) => {
        const pendingValue = pendingStatValues.current[index];

        if (pendingValue === undefined) {
          return value;
        }

        if (value === pendingValue) {
          delete pendingStatValues.current[index];
          return value;
        }

        return prev[index] ?? pendingValue;
      })
    );
  }, [currentPolyList, statCount]);

  const debouncedStatNameChange = useDebounce(
    useCallback(
      (index: number, name: string) => {
        startTransition(() => {
          onStatChange(index, { name });
        });
      },
      [onStatChange]
    ),
    1000
  );

  const debouncedStatValueChange = useDebounce(
    useCallback(
      (index: number, value: number) => {
        startTransition(() => {
          onStatChange(index, { value });
        });
      },
      [onStatChange]
    ),
    150
  );

  const debouncedSortingChange = useDebounce(
    useCallback(
      (configs: SortingConfig[]) => {
        startTransition(() => {
          onSortingChange(configs);
        });
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
      pendingStatNames.current[index] = name;
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
      pendingStatValues.current[index] = value;
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
