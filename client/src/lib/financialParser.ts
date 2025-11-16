import type { FinancialData, FinancialAccount, PLStatement, BalanceSheet, CashFlowStatement, PeriodData } from "@/types/financial";

/**
 * Parse CSV financial data into structured format
 */
export function parseFinancialCSV(csvText: string): FinancialData {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const accounts: FinancialAccount[] = [];
  let companyName = 'Company';
  
  for (const line of lines) {
    // Skip comments and headers
    if (line.startsWith('#') || line.startsWith('Section,')) {
      continue;
    }
    
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    if (parts.length < 3) continue;
    
    const [section, label, amountStr] = parts;
    const amount = parseFloat(amountStr) || 0;
    
    let category: FinancialAccount['category'];
    if (section.toLowerCase().includes('revenue')) {
      category = 'revenue';
    } else if (section.toLowerCase().includes('cost of sales') || section.toLowerCase().includes('cogs')) {
      category = 'cogs';
    } else if (section.toLowerCase().includes('expense')) {
      category = 'operating_expense';
    } else {
      continue;
    }
    
    accounts.push({
      id: `${category}-${accounts.length}`,
      name: label,
      category,
      amount,
      summaryGroup: section
    });
  }
  
  // Create period data
  const currentDate = new Date();
  const periodData: PeriodData = {
    period: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
    date: currentDate,
    accounts
  };
  
  // Calculate P&L
  const revenueAccounts = accounts.filter(a => a.category === 'revenue');
  const cogsAccounts = accounts.filter(a => a.category === 'cogs');
  const expenseAccounts = accounts.filter(a => a.category === 'operating_expense');
  
  const revenue = revenueAccounts.reduce((sum, a) => sum + a.amount, 0);
  const cogs = cogsAccounts.reduce((sum, a) => sum + a.amount, 0);
  const operatingExpenses = expenseAccounts.reduce((sum, a) => sum + a.amount, 0);
  const grossProfit = revenue - cogs;
  const netOperatingIncome = grossProfit - operatingExpenses;
  const netIncome = netOperatingIncome;
  
  const plStatement: PLStatement = {
    revenue,
    cogs,
    grossProfit,
    operatingExpenses,
    netOperatingIncome,
    otherIncome: 0,
    otherExpenses: 0,
    netIncome,
    revenueAccounts,
    cogsAccounts,
    operatingExpenseAccounts: expenseAccounts
  };
  
  // Create balance sheet (simplified - would need more data)
  const balanceSheet: BalanceSheet = {
    totalAssets: revenue * 2, // Simplified assumption
    totalLiabilities: revenue * 0.5,
    totalEquity: revenue * 1.5,
    assetAccounts: [],
    liabilityAccounts: [],
    equityAccounts: []
  };
  
  // Create cash flow statement (simplified)
  const cashFlowStatement: CashFlowStatement = {
    operatingActivities: netIncome,
    investingActivities: 0,
    financingActivities: 0,
    netCashChange: netIncome,
    beginningCash: revenue * 0.3,
    endingCash: revenue * 0.3 + netIncome,
    operatingAccounts: [],
    investingAccounts: [],
    financingAccounts: []
  };
  
  const plStatements = new Map<string, PLStatement>();
  plStatements.set(periodData.period, plStatement);
  
  const balanceSheets = new Map<string, BalanceSheet>();
  balanceSheets.set(periodData.period, balanceSheet);
  
  const cashFlowStatements = new Map<string, CashFlowStatement>();
  cashFlowStatements.set(periodData.period, cashFlowStatement);
  
  return {
    companyName,
    periods: [periodData],
    currentPeriod: periodData.period,
    plStatements,
    balanceSheets,
    cashFlowStatements
  };
}

