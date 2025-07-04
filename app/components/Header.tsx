"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  tierListName?: string;
  onTierListNameChange?: (name: string) => void;
}

export default function Header({
  tierListName,
  onTierListNameChange,
}: HeaderProps = {}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(tierListName);

  useEffect(() => {
    setEditedName(tierListName);
  }, [tierListName]);

  const pathname = usePathname();
  const showBackArrow = pathname !== "/dashboard" && pathname !== "/";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        {showBackArrow && (
          <Link href="/dashboard" className="hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        )}
        {tierListName ? (
          <div
            className="group relative cursor-pointer"
            onClick={() => {
              if (!isEditingName) {
                setIsEditingName(true);
              }
            }}
          >
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (editedName !== tierListName) {
                    onTierListNameChange?.(editedName || "");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                    if (editedName !== tierListName) {
                      onTierListNameChange?.(editedName || "");
                    }
                  }
                }}
                className="text-2xl font-bold text-blue-600 bg-transparent border-b border-slate-300 outline-none w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-2xl font-bold text-blue-600 cursor-pointer group-hover:text-blue-700">
                {tierListName}
              </h2>
            )}
          </div>
        ) : (
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            PolyTierlist
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/auth/login">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    </header>
  );
}
