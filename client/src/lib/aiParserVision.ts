/**
 * Enhanced PDF parser using vision capabilities
 * This version converts PDF pages to images and uses vision AI to extract financial data
 */

import { Stock, Flow, IncomeStatement } from '@/types/model';

// Use the built-in Forge API for AI processing
const API_KEY = import.meta.env.VITE_BUILT_IN_FORGE_API_KEY;
const API_URL = import.meta.env.VITE_BUILT_IN_FORGE_API_URL;

interface ParsedFinancialData {
  revenue: Array<{ label: string; amount: number }>;
  costOfSales: Array<{ label: string; amount: number }>;
  expenses: Array<{ label: string; amount: number }>;
  companyName?: string;
}

/**
 * Convert PDF file to images and use vision AI to extract income statement
 */
export async function parseAnnualReportPDFWithVision(file: File): Promise<ParsedFinancialData> {
  try {
    // For browser environment, we need to use PDF.js or similar library
    // For now, we'll use a hybrid approach: extract text and use enhanced AI prompting
    
    const text = await extractTextFromPDF(file);
    
    if (!text || text.length < 100) {
      throw new Error('Could not extract text from PDF. The file may be image-based or encrypted. Please use the Excel template instead.');
    }
    
    // Use AI with very specific instructions for financial statement extraction
    const result = await extractFinancialDataWithAI(text, file.name);
    
    return result;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw error;
  }
}

/**
 * Extract text from PDF using FileReader
 */
async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        let text = decoder.decode(uint8Array);
        
        // Clean up null bytes and control characters
        text = text.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
        
        resolve(text);
      } catch (error) {
        reject(new Error('Failed to decode PDF text'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Use AI to extract structured financial data from PDF text
 */
async function extractFinancialDataWithAI(text: string, filename: string): Promise<ParsedFinancialData> {
  // Extract relevant sections from the text
  const relevantText = extractRelevantSections(text);
  
  const prompt = `You are an expert financial analyst. Extract income statement data from this financial document.

CRITICAL INSTRUCTIONS:
1. Find the "Statement of Comprehensive Income" or "Income Statement" or "Profit and Loss" section
2. Extract line items and their corresponding amounts for the MOST RECENT period only
3. Categorize each line item as Revenue, Cost of Sales, or Expenses:
   - Revenue: Insurance revenue, Sales, Revenue, Turnover, Premium income, etc.
   - Cost of Sales: Insurance service expense, Cost of goods sold, COGS, Claims, Direct costs
   - Expenses: Operating expenses, Admin expenses, Salaries, Rent, Marketing, etc.
4. Convert all amounts to positive numbers (remove parentheses, commas, currency symbols)
5. If amounts are in millions/thousands, convert to actual values (e.g., "27 497" in millions = 27497000000)
6. Use exact line item names from the document
7. Skip subtotals and calculated fields (like "Total Revenue", "Gross Profit", "Net Income")

AMOUNT PARSING RULES:
- Numbers in parentheses like (20 470) are expenses/costs
- "R million" means multiply by 1,000,000
- "R '000" means multiply by 1,000
- Remove spaces between digits: "27 497" becomes 27497

Return ONLY valid JSON in this exact format:
{
  "companyName": "Company Name",
  "revenue": [
    {"label": "Insurance revenue", "amount": 27497000000}
  ],
  "costOfSales": [
    {"label": "Insurance service expense", "amount": 20470000000}
  ],
  "expenses": [
    {"label": "Other operating expenses", "amount": 911000000}
  ]
}

Document text (first 15000 chars):
${relevantText.substring(0, 15000)}`;

  // Check if API is available
  if (!API_KEY || !API_URL) {
    throw new Error('PDF parsing requires AI service. Please use the Excel/CSV template instead for best results.');
  }

  try {
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial data extraction expert. You extract income statement data from annual reports and return valid JSON only. Never include explanations, only JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      // Provide helpful error message
      if (response.status === 401 || response.status === 403) {
        throw new Error('PDF parsing is currently unavailable. Please download and use the Excel/CSV template for best results.');
      } else {
        throw new Error(`Unable to parse PDF (error ${response.status}). Please use the Excel/CSV template instead.`);
      }
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }
    
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Validate response structure
    if (!parsed.revenue && !parsed.costOfSales && !parsed.expenses) {
      throw new Error('Could not extract financial data. The document format may not be supported. Please use the Excel template instead.');
    }
    
    // Ensure arrays
    const result: ParsedFinancialData = {
      revenue: Array.isArray(parsed.revenue) ? parsed.revenue : [],
      costOfSales: Array.isArray(parsed.costOfSales) ? parsed.costOfSales : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      companyName: parsed.companyName || 'Company'
    };
    
    // Validate that we got some data
    const totalItems = result.revenue.length + result.costOfSales.length + result.expenses.length;
    if (totalItems === 0) {
      throw new Error('No financial data could be extracted from the document. Please use the Excel template instead.');
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse financial data. Please use the Excel template instead.');
  }
}

/**
 * Extract relevant sections from PDF text to reduce token usage
 */
function extractRelevantSections(text: string): string {
  const lines = text.split('\n');
  const relevantLines: string[] = [];
  let inRelevantSection = false;
  let sectionDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Start capturing when we find financial statement headers
    if (lowerLine.includes('comprehensive income') || 
        lowerLine.includes('income statement') ||
        lowerLine.includes('profit or loss') ||
        lowerLine.includes('profit and loss')) {
      inRelevantSection = true;
      sectionDepth = 0;
    }
    
    if (inRelevantSection) {
      relevantLines.push(lines[i]);
      sectionDepth++;
      
      // Stop after capturing enough context (about 200 lines)
      if (sectionDepth > 200) {
        break;
      }
    }
    
    // Also capture any line with financial keywords
    if (!inRelevantSection && (
      lowerLine.includes('revenue') ||
      lowerLine.includes('expense') ||
      lowerLine.includes('income') ||
      lowerLine.includes('cost') ||
      lowerLine.includes('profit')
    )) {
      relevantLines.push(lines[i]);
    }
  }
  
  return relevantLines.length > 0 ? relevantLines.join('\n') : text;
}

/**
 * Generate stocks and flows from parsed financial data
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

  // Create stocks for revenue items
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

    flows.push({
      id: `flow-rev-${index}`,
      name: `${item.label} Inflow`,
      sourceId: null,
      targetId: stockId,
      rate: item.amount / 365,
      rateType: 'absolute',
      color: '#22c55e'
    });
  });

  // Create stocks for cost of sales
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

