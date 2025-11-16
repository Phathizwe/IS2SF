/**
 * Financial Dashboard Types
 */

export type PeriodType = 'month' | 'quarter' | 'ytd' | 'trailing12' | 'annual';

export interface FinancialAccount {
  id: string;
  name: string;
  category: 'revenue' | 'cogs' | 'operating_expense' | 'other_expense' | 'other_income' | 
           'asset' | 'liability' | 'equity' | 'cash_operating' | 'cash_investing' | 'cash_financing';
  amount: number;
  summaryGroup?: string;
}

export interface PeriodData {
  period: string; // e.g., "2025-01", "Q1 2025", "YTD 2025"
  date: Date;
  accounts: FinancialAccount[];
}

export interface PLStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  otherIncome: number;
  otherExpenses: number;
  netIncome: number;
  revenueAccounts: FinancialAccount[];
  cogsAccounts: FinancialAccount[];
  operatingExpenseAccounts: FinancialAccount[];
}

export interface BalanceSheet {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  assetAccounts: FinancialAccount[];
  liabilityAccounts: FinancialAccount[];
  equityAccounts: FinancialAccount[];
}

export interface CashFlowStatement {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashChange: number;
  beginningCash: number;
  endingCash: number;
  operatingAccounts: FinancialAccount[];
  investingAccounts: FinancialAccount[];
  financingAccounts: FinancialAccount[];
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  current: number;
  priorPeriod: number;
  priorYear: number;
  deltaVsPrior: number;
  deltaVsPriorYear: number;
}

export interface BudgetVsActual {
  account: string;
  category: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  isGoodVariance: boolean;
}

export interface FinancialData {
  companyName: string;
  periods: PeriodData[];
  currentPeriod: string;
  plStatements: Map<string, PLStatement>;
  balanceSheets: Map<string, BalanceSheet>;
  cashFlowStatements: Map<string, CashFlowStatement>;
  budgets?: Map<string, PLStatement>;
}

