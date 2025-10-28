import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, FileText, Table, Download } from 'lucide-react';
import { downloadIncomeStatementTemplate } from '@/lib/excelTemplate';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadPDF: (file: File) => void;
  onUploadExcel: (file: File) => void;
}

export default function UploadDialog({
  open,
  onOpenChange,
  onUploadPDF,
  onUploadExcel
}: UploadDialogProps) {
  const [uploading, setUploading] = useState(false);

  const handlePDFUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(true);
        try {
          await onUploadPDF(file);
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

  const handleExcelUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(true);
        try {
          await onUploadExcel(file);
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    downloadIncomeStatementTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Financial Data</DialogTitle>
          <DialogDescription>
            Upload your financial data to automatically generate your model. <strong>Excel/CSV template recommended</strong> for best results.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* PDF Upload */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Annual Report PDF</h3>
                <p className="text-sm text-gray-500">Experimental - may not work for all PDFs</p>
              </div>
            </div>
            <Button 
              onClick={handlePDFUpload} 
              disabled={uploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Processing...' : 'Upload PDF'}
            </Button>
            <p className="text-xs text-gray-500">
              Upload your company's annual report and AI will automatically extract the income statement and create stocks & flows
            </p>
          </div>

          {/* Excel Upload */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Table className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Excel/CSV Template</h3>
                <p className="text-sm text-green-600 font-medium">✓ Recommended method</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button 
                onClick={handleExcelUpload}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Processing...' : 'Upload Filled Template'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Download our template, fill in your income statement data, and upload it to generate your model
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-1">💡 Pro Tip</p>
          <p className="text-blue-800">
            For best results with PDF upload, ensure your annual report has a clear income statement section. 
            The AI will analyze the document and automatically create appropriate stocks and flows based on your financial data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

