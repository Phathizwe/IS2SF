import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialData } from "@/types/financial";

export default function CashFlowDashboard({ data }: { data: FinancialData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>DASHBOARD_TITLE</CardTitle>
        <CardDescription>Dashboard coming soon</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600">This dashboard is under construction.</p>
      </CardContent>
    </Card>
  );
}
