export interface DiagramProperty {
  name: string;
  value: number;
}

export interface Diagram {
  id: string;
  name: string;
  thumbnail?: string;
  properties: DiagramProperty[];
}
