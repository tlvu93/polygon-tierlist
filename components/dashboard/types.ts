import { Tables } from "@/types/supabase";

export type TierListWithStats = Tables<"tier_lists"> & {
  creator?: string;
  likes?: number;
  views?: number;
  image?: string;
};

export type GroupWithItems = Tables<"groups"> & {
  items: Item[];
  isGroup: true;
};

export type Item = TierListWithStats | GroupWithItems;
