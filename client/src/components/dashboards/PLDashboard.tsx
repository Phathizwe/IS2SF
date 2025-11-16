import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinancialData } from "@/types/financial";
import { useState } from "react";

interface PLDashboardProps {
  data: FinancialData;
}

export default function PLDashboard({ data }: PLDashboardProps) {
  const [period, setPeriod] = useState('ytd');
  
  const plStatement = data.plStatements.get(data.currentPeriod);
  
  if (!plStatement) {
    return <div>No P&L data available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Condensed Profit & Loss</CardTitle>
              <CardDescription>Income and expenses summary</CardDescription>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="trailing12">Trailing 12 Months</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">Revenue</h3>
              <div className="space-y-2">
                {plStatement.revenueAccounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-700">{account.name}</span>
                    <span className="font-medium">{formatCurrency(account.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold bg-green-50 px-2 rounded">
                  <span>Total Revenue</span>
                  <span className="text-green-700">{formatCurrency(plStatement.revenue)}</span>
                </div>
              </div>
            </div>

            {/* Cost of Sales Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-orange-700">Cost of Sales</h3>
              <div className="space-y-2">
                {plStatement.cogsAccounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-700">{account.name}</span>
                    <span className="font-medium">{formatCurrency(account.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold bg-orange-50 px-2 rounded">
                  <span>Total COGS</span>
                  <span className="text-orange-700">{formatCurrency(plStatement.cogs)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center py-3 font-bold text-lg bg-blue-50 px-3 rounded">
              <span>Gross Profit</span>
              <span className="text-blue-700">{formatCurrency(plStatement.grossProfit)}</span>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-red-700">Operating Expenses</h3>
              <div className="space-y-2">
                {plStatement.operatingExpenseAccounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center py-2 border-b">
                    <span className="text-slate-700">{account.name}</span>
                    <span className="font-medium">{formatCurrency(account.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-bold bg-red-50 px-2 rounded">
                  <span>Total Operating Expenses</span>
                  <span className="text-red-700">{formatCurrency(plStatement.operatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="flex justify-between items-center py-4 font-bold text-xl bg-slate-100 px-4 rounded-lg border-2 border-slate-300">
              <span>Net Income</span>
              <span className={plStatement.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}>
                {formatCurrency(plStatement.netIncome)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

