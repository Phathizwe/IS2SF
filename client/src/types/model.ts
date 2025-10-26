export interface Position {
  x: number;
  y: number;
}

export interface Stock {
  id: string;
  name: string;
  position: Position;
  initialValue: number;
  currentValue: number;
  color: string;
}

export interface Flow {
  id: string;
  name: string;
  sourceId: string | null; // null means external source
  targetId: string | null; // null means external sink
  rate: number; // units per time step
  formula?: string; // optional formula for dynamic rates
  color: string;
}

export interface Model {
  id: string;
  name: string;
  stocks: Stock[];
  flows: Flow[];
  timeStep: number; // simulation time step in seconds
  currentTime: number;
}

export type NodeType = 'stock' | 'flow';

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  nodeType: NodeType | null;
  offset: Position;
}

