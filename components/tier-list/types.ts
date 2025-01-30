export interface DiagramStats {
  fighting: number;
  farming: number;
  supporting: number;
  pushing: number;
  versatility: number;
}

export interface Diagram {
  id: string;
  name: string;
  thumbnail?: string;
  stats?: DiagramStats;
}
