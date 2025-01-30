"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle cookie error
          console.error("Error setting cookie:", error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options });
        } catch (error) {
          // Handle cookie error
          console.error("Error removing cookie:", error);
        }
      },
    },
  });
}

export async function createGroup(userId: string, name: string, parentGroupId: string | null = null) {
  "use server";

  try {
    const supabase = await createClient();

    // Get the highest position in the current level
    const { data: positionData } = await supabase
      .from("groups")
      .select("position")
      .eq("user_id", userId)
      .eq("parent_group_id", parentGroupId)
      .order("position", { ascending: false })
      .limit(1);

    const position = positionData?.[0]?.position ?? -1;

    const { data, error } = await supabase
      .from("groups")
      .insert({
        user_id: userId,
        name,
        parent_group_id: parentGroupId,
        position: position + 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
}

export async function createTierList(userId: string, title: string, description: string | null = null) {
  "use server";

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tier_lists")
      .insert({
        user_id: userId,
        title,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating tier list:", error);
    throw new Error("Failed to create tier list");
  }
}

export async function addTierListToGroup(groupId: string, tierListId: string) {
  "use server";

  try {
    const supabase = await createClient();

    // Get the highest position in the group
    const { data: positionData } = await supabase
      .from("group_tier_lists")
      .select("position")
      .eq("group_id", groupId)
      .order("position", { ascending: false })
      .limit(1);

    const position = positionData?.[0]?.position ?? -1;

    const { data, error } = await supabase
      .from("group_tier_lists")
      .insert({
        group_id: groupId,
        tier_list_id: tierListId,
        position: position + 1,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding tier list to group:", error);
    throw new Error("Failed to add tier list to group");
  }
}

export async function getUserContent(userId: string) {
  "use server";

  try {
    const supabase = await createClient();

    // Get all groups
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("user_id", userId)
      .order("position");

    if (groupsError) throw groupsError;

    // Get all tier lists
    const { data: tierLists, error: tierListsError } = await supabase
      .from("tier_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (tierListsError) throw tierListsError;

    // Get all group-tierlist relationships
    const { data: groupTierLists, error: relationError } = await supabase
      .from("group_tier_lists")
      .select("*")
      .order("position");

    if (relationError) throw relationError;

    return {
      groups: groups || [],
      tierLists: tierLists || [],
      groupTierLists: groupTierLists || [],
    };
  } catch (error) {
    console.error("Error fetching user content:", error);
    throw new Error("Failed to fetch user content");
  }
}

export async function updateGroupPosition(groupId: string, newPosition: number) {
  "use server";

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("groups")
      .update({ position: newPosition })
      .eq("id", groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating group position:", error);
    throw new Error("Failed to update group position");
  }
}

export async function updateTierListPosition(groupId: string, tierListId: string, newPosition: number) {
  "use server";

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("group_tier_lists")
      .update({ position: newPosition })
      .eq("group_id", groupId)
      .eq("tier_list_id", tierListId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating tier list position:", error);
    throw new Error("Failed to update tier list position");
  }
}

export async function deleteGroup(groupId: string) {
  "use server";

  try {
    const supabase = await createClient();

    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }
}
