export interface Stat {
  name: string;
  value: number;
}

export interface PolyListStat {
  name: string;
  value: number;
}

export interface PolyList {
  id: string;
  name: string;
  thumbnail?: string;
  stats: PolyListStat[];
}

export interface PolyListFormData {
  name: string;
  thumbnail?: string;
}

export interface PolyListUpdateData {
  name?: string;
  thumbnail?: string;
  stats?: PolyListStat[];
}
