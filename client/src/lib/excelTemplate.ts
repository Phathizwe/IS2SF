/**
 * Generate an Excel-compatible CSV template for income statement upload
 */
export function generateIncomeStatementTemplate(): string {
  const template = [
    ['Income Statement Template'],
    [''],
    ['Instructions: Fill in the values for your business. Leave empty cells as 0.'],
    [''],
    ['Section', 'Line Item', 'Amount'],
    ['Revenue', 'Product Sales', ''],
    ['Revenue', 'Service Revenue', ''],
    ['Revenue', 'Other Revenue', ''],
    ['', '', ''],
    ['Cost of Sales', 'Direct Materials', ''],
    ['Cost of Sales', 'Direct Labor', ''],
    ['Cost of Sales', 'Manufacturing Overhead', ''],
    ['', '', ''],
    ['Expenses', 'Salaries & Wages', ''],
    ['Expenses', 'Rent', ''],
    ['Expenses', 'Utilities', ''],
    ['Expenses', 'Marketing & Advertising', ''],
    ['Expenses', 'Insurance', ''],
    ['Expenses', 'Depreciation', ''],
    ['Expenses', 'Interest Expense', ''],
    ['Expenses', 'Other Operating Expenses', '']
  ];

  return template.map(row => row.join(',')).join('\n');
}

/**
 * Download the template as a CSV file
 */
export function downloadIncomeStatementTemplate(): void {
  const csv = generateIncomeStatementTemplate();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'income-statement-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded CSV/Excel file
 */
export function parseIncomeStatementCSV(csvContent: string): {
  revenue: Array<{ label: string; amount: number }>;
  costOfSales: Array<{ label: string; amount: number }>;
  expenses: Array<{ label: string; amount: number }>;
} {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const result = {
    revenue: [] as Array<{ label: string; amount: number }>,
    costOfSales: [] as Array<{ label: string; amount: number }>,
    expenses: [] as Array<{ label: string; amount: number }>
  };

  let currentSection: 'revenue' | 'costOfSales' | 'expenses' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    
    if (parts.length < 3) continue;
    
    const [section, label, amountStr] = parts;
    
    // Determine section
    if (section.toLowerCase().includes('revenue')) {
      currentSection = 'revenue';
    } else if (section.toLowerCase().includes('cost') || section.toLowerCase().includes('cogs')) {
      currentSection = 'costOfSales';
    } else if (section.toLowerCase().includes('expense')) {
      currentSection = 'expenses';
    }
    
    // Parse line item
    if (currentSection && label && label.length > 0) {
      const amount = parseFloat(amountStr) || 0;
      if (amount !== 0 || label.length > 0) {
        result[currentSection].push({ label, amount });
      }
    }
  }

  return result;
}

