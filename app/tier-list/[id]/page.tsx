"use client";

import LocalTierListLayout from "@/components/tier-list/LocalTierListLayout";
import { localStorageAPI } from "@/utils/localStorage";
import { useState, useEffect } from "react";

export default function TierListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [tierListName, setTierListName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTierList = async () => {
      try {
        const { id } = await params;
        const tierLists = localStorageAPI.getTierLists();
        const tierList = tierLists.find((tl) => tl.id === id);

        if (tierList) {
          setTierListName(tierList.name);
        } else {
          setTierListName("Tier List");
        }
      } catch (error) {
        console.error("Error loading tier list:", error);
        setTierListName("Tier List");
      } finally {
        setIsLoading(false);
      }
    };

    loadTierList();
  }, [params]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <LocalTierListLayout tierListName={tierListName} />;
}
