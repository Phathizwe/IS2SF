import { Stock, Flow } from '@/types/model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import React from 'react';

interface PropertiesPanelProps {
  selectedStock: Stock | null;
  selectedFlow: Flow | null;
  stocks: Stock[];
  onStockUpdate: (stock: Stock) => void;
  onFlowUpdate: (flow: Flow) => void;
  onStockDelete: (stockId: string) => void;
  onFlowDelete: (flowId: string) => void;
}

// Shared style helpers
const LABEL_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono",monospace', fontSize: 9,
  letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  color: '#4A566A', marginBottom: 4,
};
const VALUE_STYLE: React.CSSProperties = {
  fontFamily: '"DM Mono",monospace', fontSize: 11,
  color: '#EDF2FF',
};
const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '6px 8px',
  background: '#171D28', border: '1px solid #1E2535',
  borderRadius: 5, color: '#EDF2FF',
  fontFamily: '"DM Mono",monospace', fontSize: 11,
  outline: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={LABEL_STYLE}>{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, type = 'text', readOnly = false }: {
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      style={{ ...INPUT_STYLE, opacity: readOnly ? 0.5 : 1 }}
    />
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 8px', borderRadius: 5, cursor: 'pointer',
        background: hov ? 'rgba(224,82,82,0.15)' : 'transparent',
        border: '1px solid rgba(224,82,82,0.4)',
        color: '#E05252', display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: '"DM Mono",monospace', fontSize: 9,
      }}
    >
      <Trash2 size={10} /> Delete
    </button>
  );
}

export default function PropertiesPanel({
  selectedStock,
  selectedFlow,
  stocks,
  onStockUpdate,
  onFlowUpdate,
  onStockDelete,
  onFlowDelete,
}: PropertiesPanelProps) {
  const panelStyle: React.CSSProperties = {
    height: '100%', display: 'flex', flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    padding: '12px 14px', borderBottom: '1px solid #1E2535',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  };

  const bodyStyle: React.CSSProperties = {
    padding: 14, flex: 1, overflowY: 'auto' as const,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: '"Syne",sans-serif', fontSize: 13, fontWeight: 600, color: '#EDF2FF',
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    fontFamily: '"DM Mono",monospace', fontSize: 9,
    padding: '2px 8px', borderRadius: 10,
    background: '#171D28', border: `1px solid ${color}`,
    color: '#8A97B0',
  });

  if (!selectedStock && !selectedFlow) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Inspector</span>
        </div>
        <div style={{
          ...bodyStyle,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, color: '#2E3A4E', marginBottom: 8 }}>◆</div>
          <div style={{ fontSize: 11, color: '#4A566A', lineHeight: 1.5 }}>
            Click any element on the canvas to inspect its properties
          </div>
        </div>
      </div>
    );
  }

  if (selectedStock) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Inspector</span>
          <span style={badgeStyle('#1F4788')}>STOCK</span>
        </div>
        <div style={bodyStyle}>
          <Field label="Name">
            <TextInput
              value={selectedStock.name}
              onChange={v => onStockUpdate({ ...selectedStock, name: v })}
            />
          </Field>
          <Field label="Initial Value">
            <TextInput
              type="number"
              value={selectedStock.initialValue}
              onChange={v => onStockUpdate({ ...selectedStock, initialValue: parseFloat(v) || 0 })}
            />
          </Field>
          <Field label="Current Value">
            <TextInput
              type="number"
              value={selectedStock.currentValue.toFixed(2)}
              readOnly
            />
          </Field>
          <Field label="Fill Level">
            <div style={{ ...VALUE_STYLE, color: '#8A97B0' }}>
              {selectedStock.initialValue > 0
                ? `${Math.min(100, (selectedStock.currentValue / (selectedStock.initialValue * 2)) * 100).toFixed(0)}%`
                : 'N/A'}
            </div>
          </Field>
          <Field label="Color">
            <input
              type="color"
              value={selectedStock.color}
              onChange={e => onStockUpdate({ ...selectedStock, color: e.target.value })}
              style={{ ...INPUT_STYLE, height: 34, padding: '2px 4px', cursor: 'pointer' }}
            />
          </Field>
          <div style={{ marginTop: 16 }}>
            <DeleteBtn onClick={() => onStockDelete(selectedStock.id)} />
          </div>
        </div>
      </div>
    );
  }

  if (selectedFlow) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Inspector</span>
          <span style={badgeStyle('#27AE60')}>FLOW</span>
        </div>
        <div style={bodyStyle}>
          <Field label="Name">
            <TextInput
              value={selectedFlow.name}
              onChange={v => onFlowUpdate({ ...selectedFlow, name: v })}
            />
          </Field>
          <Field label="Rate Type">
            <Select
              value={selectedFlow.rateType}
              onValueChange={(val: 'absolute' | 'proportional') =>
                onFlowUpdate({ ...selectedFlow, rateType: val })
              }
            >
              <SelectTrigger style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="absolute">Absolute (fixed rate)</SelectItem>
                <SelectItem value="proportional">Proportional (rate × source)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Source Stock">
            <Select
              value={selectedFlow.sourceId || 'external'}
              onValueChange={val => onFlowUpdate({ ...selectedFlow, sourceId: val === 'external' ? null : val })}
            >
              <SelectTrigger style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External Source</SelectItem>
                {stocks.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Target Stock">
            <Select
              value={selectedFlow.targetId || 'external'}
              onValueChange={val => onFlowUpdate({ ...selectedFlow, targetId: val === 'external' ? null : val })}
            >
              <SelectTrigger style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">External Sink</SelectItem>
                {stocks.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={selectedFlow.rateType === 'absolute' ? 'Rate (units/s)' : 'Rate per Source Unit'}>
            <TextInput
              type="number"
              value={selectedFlow.rate}
              onChange={v => onFlowUpdate({ ...selectedFlow, rate: parseFloat(v) || 0 })}
            />
          </Field>
          <Field label="Color">
            <input
              type="color"
              value={selectedFlow.color}
              onChange={e => onFlowUpdate({ ...selectedFlow, color: e.target.value })}
              style={{ ...INPUT_STYLE, height: 34, padding: '2px 4px', cursor: 'pointer' }}
            />
          </Field>
          <div style={{ marginTop: 16 }}>
            <DeleteBtn onClick={() => onFlowDelete(selectedFlow.id)} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
