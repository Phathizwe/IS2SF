import { Stock, Flow, IncomeStatement, IncomeStatementLine } from '@/types/model';

const API_KEY = import.meta.env.VITE_BUILT_IN_FORGE_API_KEY || '';
const API_URL = import.meta.env.VITE_BUILT_IN_FORGE_API_URL || 'https://api.deepseek.com/v1';

interface ParsedFinancialData {
  revenue: Array<{ label: string; amount: number }>;
  costOfSales: Array<{ label: string; amount: number }>;
  expenses: Array<{ label: string; amount: number }>;
  companyName?: string;
}

/**
 * Use AI to parse annual report PDF and extract income statement data
 */
export async function parseAnnualReportPDF(file: File): Promise<ParsedFinancialData> {
  // Convert PDF to text (simplified - in production would use proper PDF parsing)
  const text = await extractTextFromPDF(file);
  
  // Use AI to extract structured financial data
  const prompt = `You are a financial analyst. Extract the income statement data from the following annual report text. 
  
Return a JSON object with this structure:
{
  "companyName": "Company Name",
  "revenue": [{"label": "Product Sales", "amount": 1000000}, ...],
  "costOfSales": [{"label": "Direct Materials", "amount": 500000}, ...],
  "expenses": [{"label": "Salaries", "amount": 200000}, ...]
}

Only include line items that are explicitly mentioned. Use the actual amounts from the report.

Annual Report Text:
${text.substring(0, 8000)}`;

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to parse document with AI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return {
      revenue: parsed.revenue || [],
      costOfSales: parsed.costOfSales || [],
      expenses: parsed.expenses || [],
      companyName: parsed.companyName
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    throw new Error('Failed to extract financial data from document');
  }
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For now, return a placeholder. In production, would use pdf.js or similar
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // This is simplified - actual PDF parsing would be more complex
      resolve(e.target?.result as string || '');
    };
    reader.readAsText(file);
  });
}

/**
 * Generate stocks and flows from income statement data
 */
export function generateStocksAndFlows(data: ParsedFinancialData): {
  stocks: Stock[];
  flows: Flow[];
  incomeStatement: IncomeStatement;
} {
  const stocks: Stock[] = [];
  const flows: Flow[] = [];
  const incomeStatement: IncomeStatement = {
    revenue: [],
    costOfSales: [],
    expenses: []
  };

  let yPosition = 100;
  const xSpacing = 300;

  // Create stocks for each revenue item
  data.revenue.forEach((item, index) => {
    const stockId = `stock-rev-${index}`;
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: 100, y: yPosition },
      initialValue: item.amount,
      currentValue: item.amount,
      color: '#10b981'
    });

    incomeStatement.revenue.push({
      id: `is-rev-${index}`,
      label: item.label,
      linkedStockId: stockId,
      isCalculated: false
    });

    // Create inflow for revenue
    flows.push({
      id: `flow-rev-${index}`,
      name: `${item.label} Inflow`,
      sourceId: null,
      targetId: stockId,
      rate: item.amount / 365, // Daily rate
      rateType: 'absolute',
      color: '#22c55e'
    });

    yPosition += 100;
  });

  // Create stocks for COGS
  data.costOfSales.forEach((item, index) => {
    const stockId = `stock-cogs-${index}`;
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: 100 + xSpacing, y: 100 + index * 100 },
      initialValue: item.amount,
      currentValue: item.amount,
      color: '#f59e0b'
    });

    incomeStatement.costOfSales.push({
      id: `is-cogs-${index}`,
      label: item.label,
      linkedStockId: stockId,
      isCalculated: false
    });

    // Create outflow for COGS
    flows.push({
      id: `flow-cogs-${index}`,
      name: `${item.label} Outflow`,
      sourceId: stockId,
      targetId: null,
      rate: item.amount / 365,
      rateType: 'absolute',
      color: '#ef4444'
    });
  });

  // Create stocks for expenses
  data.expenses.forEach((item, index) => {
    const stockId = `stock-exp-${index}`;
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: 100 + xSpacing * 2, y: 100 + index * 100 },
      initialValue: item.amount,
      currentValue: item.amount,
      color: '#ef4444'
    });

    incomeStatement.expenses.push({
      id: `is-exp-${index}`,
      label: item.label,
      linkedStockId: stockId,
      isCalculated: false
    });

    // Create outflow for expenses
    flows.push({
      id: `flow-exp-${index}`,
      name: `${item.label} Outflow`,
      sourceId: stockId,
      targetId: null,
      rate: item.amount / 365,
      rateType: 'absolute',
      color: '#dc2626'
    });
  });

  return { stocks, flows, incomeStatement };
}

