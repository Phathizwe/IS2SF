import { IncomeStatement, IncomeStatementLine, Stock } from '@/types/model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Link2, Trash2 } from 'lucide-react';

interface IncomeStatementPanelProps {
  incomeStatement: IncomeStatement;
  stocks: Stock[];
  onUpdateLine: (section: 'revenue' | 'costOfSales' | 'expenses', lineId: string, updates: Partial<IncomeStatementLine>) => void;
  onAddLine: (section: 'revenue' | 'costOfSales' | 'expenses') => void;
  onDeleteLine: (section: 'revenue' | 'costOfSales' | 'expenses', lineId: string) => void;
}

export default function IncomeStatementPanel({
  incomeStatement,
  stocks,
  onUpdateLine,
  onAddLine,
  onDeleteLine
}: IncomeStatementPanelProps) {
  
  const getStockValue = (stockId: string | null): number => {
    if (!stockId) return 0;
    const stock = stocks.find(s => s.id === stockId);
    return stock?.currentValue || 0;
  };

  const calculateTotal = (lines: IncomeStatementLine[]): number => {
    return lines.reduce((sum, line) => sum + getStockValue(line.linkedStockId), 0);
  };

  const totalRevenue = calculateTotal(incomeStatement.revenue);
  const totalCOGS = calculateTotal(incomeStatement.costOfSales);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = calculateTotal(incomeStatement.expenses);
  const netIncome = grossProfit - totalExpenses;

  const renderLine = (
    line: IncomeStatementLine, 
    section: 'revenue' | 'costOfSales' | 'expenses',
    indent: boolean = false
  ) => {
    const value = getStockValue(line.linkedStockId);
    const linkedStock = line.linkedStockId ? stocks.find(s => s.id === line.linkedStockId) : null;

    return (
      <div key={line.id} className={`flex items-center gap-2 py-1 ${indent ? 'pl-4' : ''}`}>
        <Input
          value={line.label}
          onChange={(e) => onUpdateLine(section, line.id, { label: e.target.value })}
          className="flex-1 h-8 text-sm"
          placeholder="Line item name"
        />
        
        <Select
          value={line.linkedStockId || 'none'}
          onValueChange={(val) => onUpdateLine(section, line.id, { linkedStockId: val === 'none' ? null : val })}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue>
              {linkedStock ? (
                <span className="flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {linkedStock.name.substring(0, 8)}
                </span>
              ) : (
                'Not linked'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not linked</SelectItem>
            {stocks.map(stock => (
              <SelectItem key={stock.id} value={stock.id}>
                {stock.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-24 text-right text-sm font-mono">
          ${value.toFixed(2)}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteLine(section, line.id)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Income Statement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Revenue Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Revenue</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddLine('revenue')}
              className="h-6 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {incomeStatement.revenue.map(line => renderLine(line, 'revenue', true))}
          <div className="flex justify-between items-center pt-2 border-t mt-2 font-semibold">
            <span className="pl-4">Total Revenue</span>
            <span className="font-mono">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Cost of Sales Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Cost of Sales</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddLine('costOfSales')}
              className="h-6 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {incomeStatement.costOfSales.map(line => renderLine(line, 'costOfSales', true))}
          <div className="flex justify-between items-center pt-2 border-t mt-2 font-semibold">
            <span className="pl-4">Total COGS</span>
            <span className="font-mono">${totalCOGS.toFixed(2)}</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="flex justify-between items-center py-2 border-y font-bold bg-green-50">
          <span>Gross Profit</span>
          <span className={`font-mono ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${grossProfit.toFixed(2)}
          </span>
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Expenses</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddLine('expenses')}
              className="h-6 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {incomeStatement.expenses.map(line => renderLine(line, 'expenses', true))}
          <div className="flex justify-between items-center pt-2 border-t mt-2 font-semibold">
            <span className="pl-4">Total Expenses</span>
            <span className="font-mono">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        {/* Net Income */}
        <div className="flex justify-between items-center py-2 border-y font-bold bg-blue-50">
          <span>Net Income</span>
          <span className={`font-mono ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netIncome.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

