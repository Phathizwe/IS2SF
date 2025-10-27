import { useState } from 'react';
import { Stock, Flow } from '@/types/model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: Stock[];
  onCreateFlow: (flow: Omit<Flow, 'id'>) => void;
}

export default function FlowDialog({
  open,
  onOpenChange,
  stocks,
  onCreateFlow
}: FlowDialogProps) {
  const [name, setName] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [rate, setRate] = useState(5);
  const [rateType, setRateType] = useState<'absolute' | 'proportional'>('absolute');
  const [color, setColor] = useState('#6366f1');

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }

    onCreateFlow({
      name,
      sourceId,
      targetId,
      rate,
      rateType,
      color
    });

    // Reset form
    setName('');
    setSourceId(null);
    setTargetId(null);
    setRate(5);
    setRateType('absolute');
    setColor('#6366f1');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flow</DialogTitle>
          <DialogDescription>
            Define a flow between stocks or from/to external sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="flow-name">Flow Name</Label>
            <Input
              id="flow-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales, Production, Churn"
            />
          </div>

          <div>
            <Label htmlFor="source">Source Stock</Label>
            <Select value={sourceId || 'external'} onValueChange={(val) => setSourceId(val === 'external' ? null : val)}>
              <SelectTrigger id="source">
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
            <Label htmlFor="target">Target Stock</Label>
            <Select value={targetId || 'external'} onValueChange={(val) => setTargetId(val === 'external' ? null : val)}>
              <SelectTrigger id="target">
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
            <Label htmlFor="rateType">Rate Type</Label>
            <Select value={rateType} onValueChange={(val: 'absolute' | 'proportional') => setRateType(val)}>
              <SelectTrigger id="rateType">
                <SelectValue placeholder="Select rate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absolute">Absolute (fixed rate)</SelectItem>
                <SelectItem value="proportional">Proportional (rate × source)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {rateType === 'absolute' 
                ? 'Fixed rate regardless of source quantity' 
                : 'Rate multiplied by source stock quantity'}
            </p>
          </div>

          <div>
            <Label htmlFor="rate">
              {rateType === 'absolute' ? 'Flow Rate (units/second)' : 'Rate per Source Unit'}
            </Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Flow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

