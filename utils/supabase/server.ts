"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { PostgrestError } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
    }

    const cookieStore = await cookies();

    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
            throw error;
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
            throw error;
          }
        },
      },
    });

    return client;
  } catch (error) {
    console.error("Error creating Supabase client:", {
      error,
      type: error?.constructor?.name,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
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

export async function createTierList(
  userId: string,
  title: string,
  description: string | null = null,
  groupId: string | null = null
) {
  "use server";

  try {
    const supabase = await createClient();

    // Start a transaction
    const { data: tierList, error: tierListError } = await supabase
      .from("tier_lists")
      .insert({
        user_id: userId,
        title,
        description,
        position: 0, // Will be updated if needed
      })
      .select()
      .single();

    if (tierListError) throw tierListError;

    if (groupId) {
      // Add to group with the correct position
      const { data: positionData } = await supabase
        .from("group_tier_lists")
        .select("position")
        .eq("group_id", groupId)
        .order("position", { ascending: false })
        .limit(1);

      const position = positionData?.[0]?.position ?? -1;

      const { error: relationError } = await supabase.from("group_tier_lists").insert({
        group_id: groupId,
        tier_list_id: tierList.id,
        position: position + 1,
      });

      if (relationError) throw relationError;
    } else {
      // Update position at root level
      const { data: positionData } = await supabase
        .from("tier_lists")
        .select("position")
        .eq("user_id", userId)
        .order("position", { ascending: false })
        .limit(1);

      const position = positionData?.[0]?.position ?? -1;

      const { error: updateError } = await supabase
        .from("tier_lists")
        .update({ position: position + 1 })
        .eq("id", tierList.id);

      if (updateError) throw updateError;
    }

    return tierList;
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

    const groupsResult = await supabase.from("groups").select("*").eq("user_id", userId).order("position");
    if (groupsResult.error) {
      console.error("Error in groups query:", groupsResult.error);
      throw groupsResult.error;
    }

    const tierListsResult = await supabase
      .from("tier_lists")
      .select("*")
      .eq("user_id", userId)
      .order("position", { nullsFirst: true });
    if (tierListsResult.error) {
      console.error("Error in tier lists query:", tierListsResult.error);
      throw tierListsResult.error;
    }

    // Not filtered by userId here because group_tier_lists has no user_id
    // column of its own - ownership is scoped through `groups`/`tier_lists`.
    // Row Level Security (see supabase/migrations/20240131_add_group_tier_list_relations.sql)
    // is what actually restricts this to the current user's rows.
    const relationResult = await supabase.from("group_tier_lists").select("*").order("position");
    if (relationResult.error) {
      console.error("Error in relationships query:", relationResult.error);
      throw relationResult.error;
    }

    return {
      groups: groupsResult.data || [],
      tierLists: tierListsResult.data || [],
      groupTierLists: relationResult.data || [],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in getUserContent:", {
      message,
      code: error instanceof PostgrestError ? error.code : undefined,
    });
    throw new Error(`Failed to fetch user content: ${message}`);
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

export async function updateTierListPosition(groupId: string | null, tierListId: string, newPosition: number) {
  "use server";

  try {
    const supabase = await createClient();

    // First, check if the tier list is currently in a group
    const { data: currentRelation } = await supabase
      .from("group_tier_lists")
      .select("group_id")
      .eq("tier_list_id", tierListId)
      .single();

    // Start a transaction
    if (groupId) {
      // Moving to a group (either from root or another group)
      if (currentRelation) {
        // Remove from current group
        const { error: deleteError } = await supabase.from("group_tier_lists").delete().eq("tier_list_id", tierListId);

        if (deleteError) throw deleteError;
      }

      // Add to new group
      const { data, error } = await supabase
        .from("group_tier_lists")
        .insert({
          group_id: groupId,
          tier_list_id: tierListId,
          position: newPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Moving to root level
      if (currentRelation) {
        // Remove from current group
        const { error: deleteError } = await supabase.from("group_tier_lists").delete().eq("tier_list_id", tierListId);

        if (deleteError) throw deleteError;
      }

      // Update position at root level
      const { data, error } = await supabase
        .from("tier_lists")
        .update({ position: newPosition })
        .eq("id", tierListId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Error updating tier list position:", error);
    throw new Error("Failed to update tier list position");
  }
}

export async function deleteTierList(tierListId: string) {
  "use server";

  try {
    const supabase = await createClient();

    // Delete the tier list
    const { error } = await supabase.from("tier_lists").delete().eq("id", tierListId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting tier list:", error);
    throw new Error("Failed to delete tier list");
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
