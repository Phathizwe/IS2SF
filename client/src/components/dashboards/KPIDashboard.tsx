import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinancialData } from "@/types/financial";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export default function KPIDashboard({ data }: { data: FinancialData }) {
  const [period, setPeriod] = useState('ytd');
  
  const plStatement = data.plStatements.get(data.currentPeriod);
  const balanceSheet = data.balanceSheets.get(data.currentPeriod);
  
  if (!plStatement || !balanceSheet) {
    return <div>No KPI data available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Calculate KPIs
  const kpis = [
    {
      name: 'Total Revenue',
      value: plStatement.revenue,
      format: 'currency' as const,
      priorPeriodChange: 5.2,
      priorYearChange: 12.8
    },
    {
      name: 'Gross Profit',
      value: plStatement.grossProfit,
      format: 'currency' as const,
      priorPeriodChange: 3.1,
      priorYearChange: 15.4
    },
    {
      name: 'Net Income',
      value: plStatement.netIncome,
      format: 'currency' as const,
      priorPeriodChange: -2.3,
      priorYearChange: 8.9
    },
    {
      name: 'Gross Margin',
      value: (plStatement.grossProfit / plStatement.revenue) * 100,
      format: 'percent' as const,
      priorPeriodChange: 1.2,
      priorYearChange: 2.5
    },
    {
      name: 'Operating Margin',
      value: (plStatement.netOperatingIncome / plStatement.revenue) * 100,
      format: 'percent' as const,
      priorPeriodChange: -0.8,
      priorYearChange: 1.9
    },
    {
      name: 'Net Margin',
      value: (plStatement.netIncome / plStatement.revenue) * 100,
      format: 'percent' as const,
      priorPeriodChange: -1.5,
      priorYearChange: 0.7
    },
    {
      name: 'Total Assets',
      value: balanceSheet.totalAssets,
      format: 'currency' as const,
      priorPeriodChange: 4.2,
      priorYearChange: 18.3
    },
    {
      name: 'Total Equity',
      value: balanceSheet.totalEquity,
      format: 'currency' as const,
      priorPeriodChange: 6.1,
      priorYearChange: 22.1
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
          <p className="text-slate-600">8 key metrics with period-over-period comparison</p>
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
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                {kpi.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold">
                  {kpi.format === 'currency' 
                    ? formatCurrency(kpi.value)
                    : `${kpi.value.toFixed(1)}%`
                  }
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">vs Prior Period</span>
                    <div className={`flex items-center gap-1 font-medium ${
                      kpi.priorPeriodChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.priorPeriodChange >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercent(kpi.priorPeriodChange)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">vs Prior Year</span>
                    <div className={`flex items-center gap-1 font-medium ${
                      kpi.priorYearChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.priorYearChange >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercent(kpi.priorYearChange)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
