/**
 * PDF Income Statement Extractor
 * Extracts income statement data from PDF annual reports and creates a CSV template
 */

interface ExtractedIncomeStatement {
  companyName: string;
  revenue: Array<{ label: string; amount: string }>;
  costOfSales: Array<{ label: string; amount: string }>;
  expenses: Array<{ label: string; amount: string }>;
}

/**
 * Extract text from PDF file
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
 * Parse income statement from extracted text
 */
function parseIncomeStatement(text: string): ExtractedIncomeStatement {
  const lines = text.split('\n');
  const result: ExtractedIncomeStatement = {
    companyName: 'Company',
    revenue: [],
    costOfSales: [],
    expenses: []
  };

  // Try to find company name
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('limited') || 
        line.toLowerCase().includes('inc') ||
        line.toLowerCase().includes('corporation')) {
      result.companyName = line;
      break;
    }
  }

  // Find income statement section
  let inIncomeSection = false;
  let sectionType: 'revenue' | 'cogs' | 'expenses' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Detect income statement start
    if (lowerLine.includes('comprehensive income') || 
        lowerLine.includes('income statement') ||
        lowerLine.includes('profit or loss') ||
        lowerLine.includes('statement of operations')) {
      inIncomeSection = true;
      continue;
    }

    if (!inIncomeSection) continue;

    // Stop at certain sections
    if (lowerLine.includes('statement of financial position') ||
        lowerLine.includes('balance sheet') ||
        lowerLine.includes('cash flow')) {
      break;
    }

    // Identify revenue items
    if (lowerLine.includes('revenue') && !lowerLine.includes('total')) {
      sectionType = 'revenue';
      const amount = extractAmount(lines, i);
      if (amount) {
        result.revenue.push({ label: line, amount });
      }
    }
    // Identify cost of sales
    else if (lowerLine.includes('cost of') || 
             lowerLine.includes('insurance service expense') ||
             lowerLine.includes('claims') ||
             (lowerLine.includes('expense') && i < lines.length / 3)) {
      sectionType = 'cogs';
      const amount = extractAmount(lines, i);
      if (amount) {
        result.costOfSales.push({ label: line, amount });
      }
    }
    // Identify expenses
    else if (lowerLine.includes('expense') || 
             lowerLine.includes('operating') ||
             lowerLine.includes('admin') ||
             lowerLine.includes('salaries') ||
             lowerLine.includes('depreciation') ||
             lowerLine.includes('amortisation')) {
      sectionType = 'expenses';
      const amount = extractAmount(lines, i);
      if (amount) {
        result.expenses.push({ label: line, amount });
      }
    }
  }

  return result;
}

/**
 * Extract amount from nearby lines
 */
function extractAmount(lines: string[], index: number): string | null {
  // Check current line and next few lines for numbers
  for (let i = index; i < Math.min(index + 5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Look for numbers with spaces (like "27 497") or with parentheses
    const amountMatch = line.match(/(\(?\d[\d\s,]+\)?)/);
    if (amountMatch) {
      let amount = amountMatch[1];
      // Remove spaces and commas
      amount = amount.replace(/[\s,]/g, '');
      // Remove parentheses (they indicate negative numbers)
      const isNegative = amount.includes('(');
      amount = amount.replace(/[()]/g, '');
      
      if (amount.length > 0 && !isNaN(Number(amount))) {
        return isNegative ? `-${amount}` : amount;
      }
    }
  }
  
  return null;
}

/**
 * Generate CSV content from extracted data
 */
function generateCSV(data: ExtractedIncomeStatement): string {
  const lines: string[] = [];
  
  lines.push('Section,Label,Amount');
  lines.push('');
  
  // Revenue section
  lines.push('# Revenue');
  if (data.revenue.length > 0) {
    data.revenue.forEach(item => {
      lines.push(`Revenue,${escapeCSV(item.label)},${item.amount}`);
    });
  } else {
    lines.push('Revenue,Sales Revenue,0');
  }
  lines.push('');
  
  // Cost of Sales section
  lines.push('# Cost of Sales');
  if (data.costOfSales.length > 0) {
    data.costOfSales.forEach(item => {
      lines.push(`Cost of Sales,${escapeCSV(item.label)},${Math.abs(Number(item.amount))}`);
    });
  } else {
    lines.push('Cost of Sales,Cost of Goods Sold,0');
  }
  lines.push('');
  
  // Expenses section
  lines.push('# Expenses');
  if (data.expenses.length > 0) {
    data.expenses.forEach(item => {
      lines.push(`Expenses,${escapeCSV(item.label)},${Math.abs(Number(item.amount))}`);
    });
  } else {
    lines.push('Expenses,Operating Expenses,0');
    lines.push('Expenses,Administrative Expenses,0');
  }
  
  return lines.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Main function to extract income statement from PDF and create CSV
 */
export async function extractIncomeStatementFromPDF(file: File): Promise<void> {
  try {
    // Extract text from PDF
    const text = await extractTextFromPDF(file);
    
    if (!text || text.length < 100) {
      throw new Error('Could not extract text from PDF. The file may be image-based or encrypted.');
    }
    
    // Parse income statement
    const data = parseIncomeStatement(text);
    
    // Check if we found any data
    const totalItems = data.revenue.length + data.costOfSales.length + data.expenses.length;
    if (totalItems === 0) {
      throw new Error('Could not find income statement data in the PDF. Please use the blank template and fill it manually.');
    }
    
    // Generate CSV
    const csv = generateCSV(data);
    
    // Download CSV
    const filename = `${data.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_income_statement.csv`;
    downloadCSV(csv, filename);
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract income statement from PDF');
  }
}

