"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  tierListName?: string;
  isLoggedIn?: boolean;
  onTierListNameChange?: (name: string) => void;
}

export default function Header({ tierListName, isLoggedIn, onTierListNameChange }: HeaderProps = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(tierListName);

  useEffect(() => {
    setEditedName(tierListName);
  }, [tierListName]);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    if (isLoggedIn) {
      getUser();
    }
  }, [isLoggedIn, supabase.auth]);
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        {isLoggedIn && (
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
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="text-xl font-bold text-blue-600">
            PolyTierlist
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Image
                src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                alt="User"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-medium">{user?.user_metadata?.full_name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
