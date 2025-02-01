"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { PostgrestError } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  try {
    console.log("Starting Supabase client creation...");

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
    }

    const cookieStore = await cookies();
    console.log("Cookie store initialized");

    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          // console.log(`Getting cookie: ${name}`, cookie ? "found" : "not found");
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            console.log(`Setting cookie: ${name}`);
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error);
            throw error;
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            console.log(`Removing cookie: ${name}`);
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
            throw error;
          }
        },
      },
    });

    // Test the client connection
    const { data, error } = await client.auth.getSession();
    console.log("Auth session test:", {
      hasSession: !!data.session,
      error: error?.message,
    });

    return client;
  } catch (error) {
    console.error("Error creating Supabase client:", {
      error,
      type: error?.constructor?.name,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
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
    console.log("Creating Supabase client...");
    const supabase = await createClient();
    console.log("Supabase client created successfully");

    console.log("Fetching groups...");
    const groupsResult = await supabase.from("groups").select("*").eq("user_id", userId).order("position");

    console.log("Groups query result:", {
      data: groupsResult.data,
      error: groupsResult.error,
      status: groupsResult.status,
      statusText: groupsResult.statusText,
      count: groupsResult.count,
    });

    if (groupsResult.error) {
      console.error("Error in groups query:", groupsResult.error);
      throw groupsResult.error;
    }

    console.log("Fetching tier lists...");
    const tierListsResult = await supabase
      .from("tier_lists")
      .select("*")
      .eq("user_id", userId)
      .order("position", { nullsFirst: true });

    console.log("Tier lists query result:", {
      data: tierListsResult.data,
      error: tierListsResult.error,
      status: tierListsResult.status,
      statusText: tierListsResult.statusText,
      count: tierListsResult.count,
    });

    if (tierListsResult.error) {
      console.error("Error in tier lists query:", tierListsResult.error);
      throw tierListsResult.error;
    }

    console.log("Fetching group-tierlist relationships...");
    const relationResult = await supabase.from("group_tier_lists").select("*").order("position");

    console.log("Group-tierlist relationships query result:", {
      data: relationResult.data,
      error: relationResult.error,
      status: relationResult.status,
      statusText: relationResult.statusText,
      count: relationResult.count,
    });

    if (relationResult.error) {
      console.error("Error in relationships query:", relationResult.error);
      throw relationResult.error;
    }

    const result = {
      groups: groupsResult.data || [],
      tierLists: tierListsResult.data || [],
      groupTierLists: relationResult.data || [],
    };

    console.log("Successfully fetched all content:", result);
    return result;
  } catch (error: unknown) {
    console.error("Detailed error in getUserContent:", {
      error,
      type: error?.constructor?.name,
      keys: error ? Object.keys(error) : [],
      toString: error?.toString?.(),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const message = error instanceof Error ? error.message : "Unknown error";
    if (error instanceof PostgrestError) {
      console.error("PostgrestError details:", {
        details: error.details,
        hint: error.hint,
        code: error.code,
        message: error.message,
      });
    }
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
