export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      tier_lists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tiers: {
        Row: {
          id: string;
          tier_list_id: string;
          name: string;
          color: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tier_list_id: string;
          name: string;
          color: string;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tier_list_id?: string;
          name?: string;
          color?: string;
          position?: number;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          tier_id: string;
          name: string;
          image_url: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tier_id: string;
          name: string;
          image_url?: string | null;
          position: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tier_id?: string;
          name?: string;
          image_url?: string | null;
          position?: number;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_group_id: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_group_id?: string | null;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          parent_group_id?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_tier_lists: {
        Row: {
          group_id: string;
          tier_list_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          group_id: string;
          tier_list_id: string;
          position: number;
          created_at?: string;
        };
        Update: {
          group_id?: string;
          tier_list_id?: string;
          position?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updatable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
