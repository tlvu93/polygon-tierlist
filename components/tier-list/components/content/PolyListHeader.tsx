"use client";

import { useState, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PolyListHeaderProps {
  currentPolyListName: string;
  currentPolyListId: string;
  view: "polyList" | "table";
  onViewChange: (view: "polyList" | "table") => void;
  onPolyListDelete?: (id: string) => void;
  onPolyListNameChange?: (id: string, name: string) => void;
}

export function PolyListHeader({
  currentPolyListName,
  currentPolyListId,
  view,
  onViewChange,
  onPolyListDelete,
  onPolyListNameChange,
}: PolyListHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localName, setLocalName] = useState("");

  const debouncedNameChange = useDebounce((id: string, name: string) => {
    startTransition(() => {
      onPolyListNameChange?.(id, name);
    });
  }, 700);

  const handleNameEdit = () => {
    if (!isEditingName) {
      setIsEditingName(true);
      setLocalName(currentPolyListName || "");
    }
  };

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalName(newValue);
    debouncedNameChange(currentPolyListId, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="group relative" onClick={handleNameEdit}>
          {isEditingName ? (
            <input
              type="text"
              value={localName}
              onChange={handleNameChange}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              className={`text-2xl font-semibold bg-transparent border-b border-slate-300 outline-none w-full ${
                isPending ? "text-slate-400" : ""
              }`}
              autoFocus
            />
          ) : (
            <h2 className="text-2xl font-semibold cursor-pointer group-hover:text-blue-600">
              {currentPolyListName || "Untitled Poly List"}
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPolyListDelete?.(currentPolyListId)}
          className="h-10 w-10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Button
        variant="outline"
        onClick={() => onViewChange(view === "polyList" ? "table" : "polyList")}
      >
        {view === "polyList" ? "Switch to Table" : "Switch to Poly List"}
      </Button>
    </div>
  );
}
