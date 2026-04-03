export interface LocalTierList {
  id: string;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at: string;
  creator: string;
  likes: number;
  views: number;
  image: string;
}

export interface LocalGroup {
  id: string;
  name: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at: string;
  items: LocalTierList[];
  isGroup: true;
}

export type LocalItem = LocalTierList | LocalGroup;
