import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialData } from "@/types/financial";

export default function BalanceSheetDashboard({ data }: { data: FinancialData }) {
  const balanceSheet = data.balanceSheets.get(data.currentPeriod);
  if (!balanceSheet) return <div>No balance sheet data</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet</CardTitle>
        <CardDescription>Assets, Liabilities, and Equity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3 text-blue-700">Assets</h3>
          <div className="flex justify-between py-2 font-bold bg-blue-50 px-2 rounded">
            <span>Total Assets</span>
            <span>{formatCurrency(balanceSheet.totalAssets)}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 text-red-700">Liabilities</h3>
          <div className="flex justify-between py-2 font-bold bg-red-50 px-2 rounded">
            <span>Total Liabilities</span>
            <span>{formatCurrency(balanceSheet.totalLiabilities)}</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3 text-green-700">Equity</h3>
          <div className="flex justify-between py-2 font-bold bg-green-50 px-2 rounded">
            <span>Total Equity</span>
            <span>{formatCurrency(balanceSheet.totalEquity)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
