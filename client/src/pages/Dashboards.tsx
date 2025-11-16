import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Import dashboard components (will create these)
import PLDashboard from "@/components/dashboards/PLDashboard";
import BalanceSheetDashboard from "@/components/dashboards/BalanceSheetDashboard";
import CashFlowDashboard from "@/components/dashboards/CashFlowDashboard";
import ThreeStatementDashboard from "@/components/dashboards/ThreeStatementDashboard";
import ComparisonDashboard from "@/components/dashboards/ComparisonDashboard";
import KPIDashboard from "@/components/dashboards/KPIDashboard";
import BudgetVsActualsDashboard from "@/components/dashboards/BudgetVsActualsDashboard";
import CashRunwayDashboard from "@/components/dashboards/CashRunwayDashboard";
import MarginsDashboard from "@/components/dashboards/MarginsDashboard";
import NonGAAPDashboard from "@/components/dashboards/NonGAAPDashboard";

import type { FinancialData } from "@/types/financial";
import { parseFinancialCSV } from "@/lib/financialParser";

export default function Dashboards() {
  const [, setLocation] = useLocation();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load financial data from localStorage
    const csvData = localStorage.getItem('financialData');
    if (!csvData) {
      toast.error('No financial data found. Please upload a file first.');
      setLocation('/');
      return;
    }

    try {
      const parsed = parseFinancialCSV(csvData);
      setFinancialData(parsed);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse financial data');
      setLocation('/');
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  if (loading || !financialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{financialData.companyName}</h1>
                <p className="text-sm text-slate-600">Financial Dashboards</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/modeler')}
              >
                Stocks & Flows Model
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Tabs */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="pl" className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto p-2 bg-white">
            <TabsTrigger value="pl" className="text-xs">P&L</TabsTrigger>
            <TabsTrigger value="balance" className="text-xs">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow" className="text-xs">Cash Flow</TabsTrigger>
            <TabsTrigger value="three" className="text-xs">3-Statement</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">Comparison</TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs">KPIs</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">Budget vs Actual</TabsTrigger>
            <TabsTrigger value="runway" className="text-xs">Cash Runway</TabsTrigger>
            <TabsTrigger value="margins" className="text-xs">Margins</TabsTrigger>
            <TabsTrigger value="nongaap" className="text-xs">Non-GAAP</TabsTrigger>
          </TabsList>

          <TabsContent value="pl">
            <PLDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="balance">
            <BalanceSheetDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="three">
            <ThreeStatementDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="kpi">
            <KPIDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetVsActualsDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="runway">
            <CashRunwayDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="margins">
            <MarginsDashboard data={financialData} />
          </TabsContent>

          <TabsContent value="nongaap">
            <NonGAAPDashboard data={financialData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

