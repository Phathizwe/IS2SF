import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Plus, Download, Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ToolbarProps {
  isSimulating: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onAddStock: () => void;
  onAddFlow: () => void;
  onExport: () => void;
  onImport: () => void;
  onLoadTemplate: () => void;
  currentTime: number;
}

export default function Toolbar({
  isSimulating,
  onPlayPause,
  onReset,
  onAddStock,
  onAddFlow,
  onExport,
  onImport,
  onLoadTemplate,
  currentTime
}: ToolbarProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Stocks & Flows Modeler</h1>
          <span className="text-sm text-gray-500">Time: {currentTime.toFixed(1)}s</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Simulation Controls */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant={isSimulating ? "default" : "outline"}
              size="sm"
              onClick={onPlayPause}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSimulating ? 'Pause' : 'Play'}
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          
          {/* Add Elements */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button variant="outline" size="sm" onClick={onAddStock}>
              <Plus className="w-4 h-4" />
              Add Stock
            </Button>
            <Button variant="outline" size="sm" onClick={onAddFlow}>
              <Plus className="w-4 h-4" />
              Add Flow
            </Button>
          </div>
          
          {/* Import/Export */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onLoadTemplate}>
              <FileText className="w-4 h-4" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

