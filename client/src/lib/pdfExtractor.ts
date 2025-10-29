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
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result: ExtractedIncomeStatement = {
    companyName: 'Company',
    revenue: [],
    costOfSales: [],
    expenses: []
  };

  // Try to find company name in first 50 lines
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i];
    if ((line.toLowerCase().includes('limited') || 
        line.toLowerCase().includes('inc') ||
        line.toLowerCase().includes('corporation') ||
        line.toLowerCase().includes('company')) &&
        line.length < 100 &&
        !line.toLowerCase().includes('statement')) {
      result.companyName = line;
      break;
    }
  }

  // Find income statement section - look for key phrases
  let inIncomeSection = false;
  let incomeStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Detect income statement start
    if (lowerLine.includes('statement of comprehensive income') ||
        lowerLine.includes('condensed consolidated statement') ||
        lowerLine.includes('income statement') ||
        lowerLine.includes('profit or loss') ||
        (lowerLine.includes('insurance revenue') && !inIncomeSection)) {
      inIncomeSection = true;
      incomeStartIndex = i;
      break;
    }
  }

  if (!inIncomeSection) {
    // Fallback: look for revenue anywhere
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('revenue') && 
          !lines[i].toLowerCase().includes('total') &&
          lines[i].length < 100) {
        inIncomeSection = true;
        incomeStartIndex = i;
        break;
      }
    }
  }

  if (!inIncomeSection || incomeStartIndex === -1) {
    return result;
  }

  // Parse the income statement section
  // Strategy: Look for labels, then search nearby lines for numbers
  const endIndex = Math.min(incomeStartIndex + 200, lines.length);
  
  for (let i = incomeStartIndex; i < endIndex; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Stop at certain sections
    if (lowerLine.includes('statement of financial position') ||
        lowerLine.includes('balance sheet') ||
        lowerLine.includes('statement of changes') ||
        (lowerLine.includes('cash flow') && i > incomeStartIndex + 20)) {
      break;
    }

    // Revenue items
    if ((lowerLine.includes('revenue') || lowerLine.includes('sales') || lowerLine.includes('income')) &&
        !lowerLine.includes('total') &&
        !lowerLine.includes('net') &&
        !lowerLine.includes('other') &&
        line.length < 100) {
      
      const amount = findNearbyAmount(lines, i);
      if (amount) {
        result.revenue.push({ 
          label: cleanLabel(line), 
          amount: amount 
        });
      }
    }
    // Cost of sales / service expenses
    else if ((lowerLine.includes('cost of') || 
             lowerLine.includes('service expense') ||
             lowerLine.includes('claims') ||
             lowerLine.includes('cogs')) &&
             !lowerLine.includes('total') &&
             line.length < 100) {
      
      const amount = findNearbyAmount(lines, i);
      if (amount) {
        result.costOfSales.push({ 
          label: cleanLabel(line), 
          amount: amount 
        });
      }
    }
    // Operating expenses
    else if ((lowerLine.includes('operating expense') ||
             lowerLine.includes('admin') ||
             lowerLine.includes('salaries') ||
             lowerLine.includes('depreciation') ||
             lowerLine.includes('amortisation') ||
             (lowerLine.includes('expense') && !lowerLine.includes('service') && !lowerLine.includes('finance'))) &&
             !lowerLine.includes('total') &&
             line.length < 100) {
      
      const amount = findNearbyAmount(lines, i);
      if (amount) {
        result.expenses.push({ 
          label: cleanLabel(line), 
          amount: amount 
        });
      }
    }
  }

  return result;
}

/**
 * Clean label text
 */
function cleanLabel(label: string): string {
  return label
    .replace(/^[-–—]\s*/, '') // Remove leading dashes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Find amount in nearby lines (before or after the label)
 */
function findNearbyAmount(lines: string[], index: number): string | null {
  // Check previous lines first (numbers often appear above labels in tables)
  for (let i = Math.max(0, index - 5); i < index; i++) {
    const amount = extractAmountFromLine(lines[i]);
    if (amount && isReasonableAmount(amount)) {
      return amount;
    }
  }
  
  // Then check current and next few lines
  for (let i = index; i < Math.min(index + 5, lines.length); i++) {
    const amount = extractAmountFromLine(lines[i]);
    if (amount && isReasonableAmount(amount)) {
      return amount;
    }
  }
  
  return null;
}

/**
 * Extract amount from a line
 */
function extractAmountFromLine(line: string): string | null {
  // Look for numbers with spaces (like "27 497" or "2 468")
  // or with commas (like "27,497") or parentheses for negatives
  const patterns = [
    /(\d[\d\s,]+\d)/,  // Numbers with spaces or commas
    /\((\d[\d\s,]+\d)\)/,  // Numbers in parentheses (negative)
    /(\d+)/  // Simple numbers
  ];

  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      let amount = match[1] || match[0];
      // Remove spaces and commas
      amount = amount.replace(/[\s,]/g, '');
      
      // Check if it's in parentheses (negative)
      const isNegative = line.includes('(') && line.includes(')');
      
      if (!isNaN(Number(amount))) {
        return isNegative ? `-${amount}` : amount;
      }
    }
  }
  
  return null;
}

/**
 * Check if amount is reasonable (not a year, page number, etc.)
 */
function isReasonableAmount(amount: string): boolean {
  const num = Math.abs(Number(amount));
  // Exclude years (2024, 2025, etc.) and small page numbers
  if (num >= 1900 && num <= 2100) return false;
  if (num < 10) return false;
  return true;
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
      const absAmount = Math.abs(Number(item.amount));
      lines.push(`Cost of Sales,${escapeCSV(item.label)},${absAmount}`);
    });
  } else {
    lines.push('Cost of Sales,Cost of Goods Sold,0');
  }
  lines.push('');
  
  // Expenses section
  lines.push('# Expenses');
  if (data.expenses.length > 0) {
    data.expenses.forEach(item => {
      const absAmount = Math.abs(Number(item.amount));
      lines.push(`Expenses,${escapeCSV(item.label)},${absAmount}`);
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

