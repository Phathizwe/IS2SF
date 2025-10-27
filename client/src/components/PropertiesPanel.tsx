import { Stock, Flow } from '@/types/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedStock: Stock | null;
  selectedFlow: Flow | null;
  stocks: Stock[];
  onStockUpdate: (stock: Stock) => void;
  onFlowUpdate: (flow: Flow) => void;
  onStockDelete: (stockId: string) => void;
  onFlowDelete: (flowId: string) => void;
}

export default function PropertiesPanel({
  selectedStock,
  selectedFlow,
  stocks,
  onStockUpdate,
  onFlowUpdate,
  onStockDelete,
  onFlowDelete
}: PropertiesPanelProps) {
  if (!selectedStock && !selectedFlow) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Select a stock or flow to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedStock) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stock Properties
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onStockDelete(selectedStock.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stock-name">Name</Label>
            <Input
              id="stock-name"
              value={selectedStock.name}
              onChange={(e) => onStockUpdate({ ...selectedStock, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="stock-initial">Initial Value</Label>
            <Input
              id="stock-initial"
              type="number"
              value={selectedStock.initialValue}
              onChange={(e) => onStockUpdate({ 
                ...selectedStock, 
                initialValue: parseFloat(e.target.value) || 0 
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="stock-current">Current Value</Label>
            <Input
              id="stock-current"
              type="number"
              value={selectedStock.currentValue.toFixed(2)}
              readOnly
              disabled
            />
          </div>
          
          <div>
            <Label htmlFor="stock-color">Color</Label>
            <Input
              id="stock-color"
              type="color"
              value={selectedStock.color}
              onChange={(e) => onStockUpdate({ ...selectedStock, color: e.target.value })}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedFlow) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Flow Properties
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onFlowDelete(selectedFlow.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="flow-name">Name</Label>
            <Input
              id="flow-name"
              value={selectedFlow.name}
              onChange={(e) => onFlowUpdate({ ...selectedFlow, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="flow-rateType">Rate Type</Label>
            <Select 
              value={selectedFlow.rateType} 
              onValueChange={(val: 'absolute' | 'proportional') => onFlowUpdate({ 
                ...selectedFlow, 
                rateType: val 
              })}
            >
              <SelectTrigger id="flow-rateType">
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absolute">Absolute (fixed rate)</SelectItem>
                <SelectItem value="proportional">Proportional (rate × source)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedFlow.rateType === 'absolute' 
                ? 'Fixed rate regardless of source quantity' 
                : 'Rate multiplied by source stock quantity'}
            </p>
          </div>
          
          <div>
            <Label htmlFor="flow-source">Source Stock</Label>
            <Select 
              value={selectedFlow.sourceId || 'external'} 
              onValueChange={(val) => onFlowUpdate({ 
                ...selectedFlow, 
                sourceId: val === 'external' ? null : val 
              })}
            >
              <SelectTrigger id="flow-source">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External Source</SelectItem>
                {stocks.map(stock => (
                  <SelectItem key={stock.id} value={stock.id}>
                    {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="flow-target">Target Stock</Label>
            <Select 
              value={selectedFlow.targetId || 'external'} 
              onValueChange={(val) => onFlowUpdate({ 
                ...selectedFlow, 
                targetId: val === 'external' ? null : val 
              })}
            >
              <SelectTrigger id="flow-target">
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External Sink</SelectItem>
                {stocks.map(stock => (
                  <SelectItem key={stock.id} value={stock.id}>
                    {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="flow-rate">
              {selectedFlow.rateType === 'absolute' ? 'Flow Rate (units/second)' : 'Rate per Source Unit'}
            </Label>
            <Input
              id="flow-rate"
              type="number"
              step="0.01"
              value={selectedFlow.rate}
              onChange={(e) => onFlowUpdate({ 
                ...selectedFlow, 
                rate: parseFloat(e.target.value) || 0 
              })}
            />
          </div>
          
          <div>
            <Label htmlFor="flow-color">Color</Label>
            <Input
              id="flow-color"
              type="color"
              value={selectedFlow.color}
              onChange={(e) => onFlowUpdate({ ...selectedFlow, color: e.target.value })}
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

