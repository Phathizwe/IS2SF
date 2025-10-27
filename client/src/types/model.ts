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

export type FlowRateType = 'absolute' | 'proportional';

export interface Flow {
  id: string;
  name: string;
  sourceId: string | null; // null means external source
  targetId: string | null; // null means external sink
  rate: number; // units per time step (absolute) or rate per source unit (proportional)
  rateType: FlowRateType; // 'absolute' for fixed rate, 'proportional' for rate * source quantity
  formula?: string; // optional formula for dynamic rates
  color: string;
}

export interface IncomeStatementLine {
  id: string;
  label: string;
  linkedStockId: string | null;
  isCalculated: boolean; // true for calculated fields like Gross Profit, Net Income
}

export interface IncomeStatement {
  revenue: IncomeStatementLine[];
  costOfSales: IncomeStatementLine[];
  expenses: IncomeStatementLine[];
}

export interface Model {
  id: string;
  name: string;
  stocks: Stock[];
  flows: Flow[];
  incomeStatement: IncomeStatement;
  timeStep: number;
  currentTime: number;
}

export type NodeType = 'stock' | 'flow';

export interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  nodeType: NodeType | null;
  offset: Position;
}

