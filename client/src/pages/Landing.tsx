import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, BarChart3, TrendingUp, DollarSign, PieChart } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { extractIncomeStatementFromPDF } from "@/lib/pdfExtractor";
import { toast } from "sonner";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a PDF or CSV file');
      return;
    }

    setIsUploading(true);

    try {
      if (file.type === 'application/pdf') {
        // Extract from PDF and generate CSV
        await extractIncomeStatementFromPDF(file);
        toast.success('Income statement extracted! Please upload the generated CSV file.');
      } else {
        // Parse CSV and navigate to dashboards
        const text = await file.text();
        // Store the CSV data in localStorage for now
        localStorage.setItem('financialData', text);
        toast.success('Financial data loaded successfully!');
        setLocation('/dashboards');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDemoData = () => {
    // Load demo data
    const demoCSV = `Section,Label,Amount
# Revenue
Revenue,Product Sales,1500000
Revenue,Service Revenue,800000
# Cost of Sales
Cost of Sales,Cost of Goods Sold,600000
Cost of Sales,Direct Labor,250000
# Expenses
Expenses,Salaries & Wages,400000
Expenses,Rent & Utilities,80000
Expenses,Marketing & Advertising,120000
Expenses,Administrative Expenses,60000`;
    
    localStorage.setItem('financialData', demoCSV);
    toast.success('Demo data loaded!');
    setLocation('/dashboards');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Business Health Dashboard</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/modeler')}
          >
            Stocks & Flows Modeler
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Understand Your Business in 10 Dashboards
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Upload your annual report or financial data and instantly visualize your business health 
            across 10 comprehensive dashboards
          </p>

          {/* Upload Card */}
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <Upload className="h-6 w-6" />
                Get Started
              </CardTitle>
              <CardDescription>
                Upload your annual report (PDF) or income statement (CSV) to begin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-slate-400" />
                  <span className="text-lg font-medium">
                    {isUploading ? 'Processing...' : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-slate-500">
                    PDF Annual Report or CSV Income Statement
                  </span>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDemoData}
              >
                Try with Demo Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">P&L Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Condensed profit & loss with custom period views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Cash Flow Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Monitor cash runway and projected cash out dates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Budget vs Actuals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Variance analysis with visual indicators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">KPI Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                8 key metrics with period-over-period comparison
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

