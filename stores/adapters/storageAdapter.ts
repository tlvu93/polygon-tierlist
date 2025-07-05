import { createClient } from "@/utils/supabase/client";

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// localStorage adapter - immediate implementation
export const localStorageAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.error("localStorage getItem error:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("localStorage setItem error:", error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("localStorage removeItem error:", error);
    }
  },
};

// Supabase adapter - future implementation (ready to use)
export const supabaseAdapter: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("data")
        .eq("key", key)
        .single();

      if (error) {
        console.error("Supabase getItem error:", error);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error("Supabase getItem error:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .upsert({ key, data: value });

      if (error) {
        console.error("Supabase setItem error:", error);
      }
    } catch (error) {
      console.error("Supabase setItem error:", error);
    }
  },
  removeItem: async (key: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .delete()
        .eq("key", key);

      if (error) {
        console.error("Supabase removeItem error:", error);
      }
    } catch (error) {
      console.error("Supabase removeItem error:", error);
    }
  },
};

// Adapter selector - switch between localStorage and Supabase
export const getStorageAdapter = (useSupabase = false): StorageAdapter => {
  // For now, always use localStorage
  // Later, you can switch based on user authentication status
  return useSupabase ? supabaseAdapter : localStorageAdapter;
};

// Custom storage for Zustand persist middleware
export const createCustomStorage = (adapter: StorageAdapter) => ({
  getItem: async (name: string) => {
    const value = await adapter.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: unknown) => {
    await adapter.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await adapter.removeItem(name);
  },
});
