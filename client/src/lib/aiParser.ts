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
 * Use AI with vision to parse annual report PDF and extract income statement data
 */
export async function parseAnnualReportPDF(file: File): Promise<ParsedFinancialData> {
  try {
    // Convert PDF pages to images for vision analysis
    const formData = new FormData();
    formData.append('file', file);
    
    // For now, we'll use text extraction with enhanced prompting
    const text = await extractTextFromPDF(file);
    
    if (!text || text.length < 100) {
      throw new Error('Could not extract sufficient text from PDF');
    }
    
    // Use AI to extract structured financial data with better prompt
    const prompt = `You are a financial analyst expert. Analyze this financial document and extract the income statement data.

IMPORTANT INSTRUCTIONS:
1. Look for sections labeled: Revenue, Income, Sales, Turnover (for revenue items)
2. Look for: Cost of Sales, COGS, Cost of Goods Sold, Direct Costs (for cost of sales)
3. Look for: Operating Expenses, Expenses, Overheads, Administrative Expenses (for expenses)
4. Extract ONLY the most recent period's actual amounts (not comparatives or budgets)
5. Use the line item names exactly as they appear in the document
6. Convert all amounts to numbers (remove currency symbols, commas, parentheses)
7. If amounts are in thousands/millions, convert to actual values

Return a JSON object with this exact structure:
{
  "companyName": "Company Name from document",
  "revenue": [
    {"label": "Exact line item name", "amount": 1000000}
  ],
  "costOfSales": [
    {"label": "Exact line item name", "amount": 500000}
  ],
  "expenses": [
    {"label": "Exact line item name", "amount": 200000}
  ]
}

Document excerpt (first 12000 characters):
${text.substring(0, 12000)}`;

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial analyst who extracts income statement data from annual reports. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`AI API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }
    
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate the response has the required structure
    if (!parsed.revenue && !parsed.expenses) {
      throw new Error('AI could not extract financial data from document');
    }
    
    return {
      revenue: Array.isArray(parsed.revenue) ? parsed.revenue : [],
      costOfSales: Array.isArray(parsed.costOfSales) ? parsed.costOfSales : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      companyName: parsed.companyName || 'Company'
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to extract financial data from PDF');
  }
}

/**
 * Extract text from PDF file using browser's File API
 */
async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Use pdf.js library if available (would need to be installed)
        // For now, we'll try to read as text
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(uint8Array);
        
        // Clean up the text
        text = text.replace(/\0/g, '');
        
        if (text.length < 100) {
          reject(new Error('PDF appears to be image-based or encrypted. Please use the Excel template instead.'));
        } else {
          resolve(text);
        }
      } catch (error) {
        reject(new Error('Failed to read PDF file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
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

  let stockIndex = 0;
  const columnWidth = 350;
  const rowHeight = 120;
  const startX = 150;
  const startY = 150;

  // Create stocks for each revenue item
  data.revenue.forEach((item, index) => {
    const stockId = `stock-rev-${stockIndex++}`;
    const yPos = startY + (index * rowHeight);
    
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: startX, y: yPos },
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
  });

  // Create stocks for COGS
  data.costOfSales.forEach((item, index) => {
    const stockId = `stock-cogs-${stockIndex++}`;
    const yPos = startY + (index * rowHeight);
    
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: startX + columnWidth, y: yPos },
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
    const stockId = `stock-exp-${stockIndex++}`;
    const yPos = startY + (index * rowHeight);
    
    stocks.push({
      id: stockId,
      name: item.label,
      position: { x: startX + (columnWidth * 2), y: yPos },
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

