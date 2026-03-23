import { IncomeStatement, IncomeStatementLine, Stock } from '@/types/model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Link2, Trash2 } from 'lucide-react';
import React from 'react';

interface IncomeStatementPanelProps {
  incomeStatement: IncomeStatement;
  stocks: Stock[];
  onUpdateLine: (section: 'revenue' | 'costOfSales' | 'expenses', lineId: string, updates: Partial<IncomeStatementLine>) => void;
  onAddLine: (section: 'revenue' | 'costOfSales' | 'expenses') => void;
  onDeleteLine: (section: 'revenue' | 'costOfSales' | 'expenses', lineId: string) => void;
}

const SB_LABEL: React.CSSProperties = {
  fontFamily: '"DM Mono",monospace', fontSize: 9,
  letterSpacing: '0.12em', textTransform: 'uppercase' as const,
  color: '#4A566A', marginBottom: 10,
};

const SECTION: React.CSSProperties = {
  padding: '12px 14px', borderBottom: '1px solid #1E2535',
};

function MCard({
  name, value, highlight, accentColor, linkedStock, onDelete, onLinkChange, stocks, section, lineId, onNameChange, onUpdateLine,
}: {
  name: string; value: number; highlight?: boolean; accentColor: string;
  linkedStock: Stock | null; onDelete: () => void;
  onLinkChange: (stockId: string | null) => void;
  stocks: Stock[]; section: 'revenue' | 'costOfSales' | 'expenses'; lineId: string;
  onNameChange: (v: string) => void;
  onUpdateLine: (section: 'revenue' | 'costOfSales' | 'expenses', lineId: string, updates: Partial<IncomeStatementLine>) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [hov, setHov] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#1E2535' : '#171D28',
        border: '1px solid #1E2535',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 6, padding: '7px 9px',
        marginBottom: 5, cursor: 'default',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={e => onNameChange(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={e => e.key === 'Enter' && setEditing(false)}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: '"Lato",sans-serif', fontSize: 11, fontWeight: 600, color: '#EDF2FF',
            }}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            style={{ fontSize: 11, fontWeight: 600, color: '#EDF2FF', flex: 1 }}
            title="Double-click to rename"
          >
            {name}
          </span>
        )}
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A566A', padding: '0 0 0 4px', display: hov ? 'block' : 'none' }}
        >
          <Trash2 size={10} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <Select
          value={linkedStock?.id || 'none'}
          onValueChange={val => onLinkChange(val === 'none' ? null : val)}
        >
          <SelectTrigger style={{
            flex: 1, height: 22, padding: '0 6px',
            background: '#0f1f3d', border: '1px solid #1E2535',
            borderRadius: 4, fontFamily: '"DM Mono",monospace', fontSize: 9, color: '#8A97B0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <SelectValue>
              {linkedStock ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Link2 size={8} style={{ color: '#27AE60' }} />
                  {linkedStock.name.substring(0, 10)}
                </span>
              ) : (
                <span style={{ color: '#4A566A' }}>not linked</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not linked</SelectItem>
            {stocks.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: '#8A97B0', whiteSpace: 'nowrap' }}>
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
        padding: '4px 8px', borderRadius: 4, cursor: 'pointer',
        background: hov ? '#1E2535' : 'transparent',
        border: '1px dashed #2A3550', color: '#4A566A',
        fontFamily: '"DM Mono",monospace', fontSize: 9,
        width: '100%', justifyContent: 'center',
      }}
    >
      <Plus size={9} /> Add line
    </button>
  );
}

function TotalRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderTop: '1px solid #1E2535', marginTop: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#8A97B0' }}>{label}</span>
      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color }}>{value.toFixed(1)}</span>
    </div>
  );
}

function SummaryRow({ label, value, big = false }: { label: string; value: number; big?: boolean }) {
  const isPos = value >= 0;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: big ? '8px 10px' : '6px 10px',
      background: big ? '#171D28' : '#131820',
      border: '1px solid #1E2535', borderRadius: 5, marginBottom: 4,
    }}>
      <span style={{ fontFamily: '"Syne",sans-serif', fontSize: big ? 12 : 11, fontWeight: 600, color: '#EDF2FF' }}>
        {label}
      </span>
      <span style={{
        fontFamily: '"DM Mono",monospace', fontSize: big ? 12 : 11,
        color: isPos ? '#2ECC71' : '#E05252',
      }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export default function IncomeStatementPanel({
  incomeStatement,
  stocks,
  onUpdateLine,
  onAddLine,
  onDeleteLine,
}: IncomeStatementPanelProps) {
  const getVal = (stockId: string | null) => {
    if (!stockId) return 0;
    return stocks.find(s => s.id === stockId)?.currentValue || 0;
  };

  const totalRevenue = incomeStatement.revenue.reduce((s, l) => s + getVal(l.linkedStockId), 0);
  const totalCOGS = incomeStatement.costOfSales.reduce((s, l) => s + getVal(l.linkedStockId), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = incomeStatement.expenses.reduce((s, l) => s + getVal(l.linkedStockId), 0);
  const netIncome = grossProfit - totalExpenses;

  return (
    <div style={{ height: '100%' }}>
      {/* Panel header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1E2535' }}>
        <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 13, fontWeight: 600, color: '#EDF2FF', marginBottom: 2 }}>
          Income Statement
        </div>
        <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 9, letterSpacing: '0.12em', color: '#4A566A' }}>
          LINKED TO MODEL STOCKS
        </div>
      </div>

      {/* Revenue */}
      <div style={SECTION}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={SB_LABEL}>Revenue</div>
        </div>
        {incomeStatement.revenue.map(line => (
          <MCard
            key={line.id}
            name={line.label}
            value={getVal(line.linkedStockId)}
            accentColor="#1F4788"
            linkedStock={stocks.find(s => s.id === line.linkedStockId) || null}
            onDelete={() => onDeleteLine('revenue', line.id)}
            onLinkChange={id => onUpdateLine('revenue', line.id, { linkedStockId: id })}
            onNameChange={v => onUpdateLine('revenue', line.id, { label: v })}
            stocks={stocks}
            section="revenue"
            lineId={line.id}
            onUpdateLine={onUpdateLine}
          />
        ))}
        <AddBtn onClick={() => onAddLine('revenue')} />
        <TotalRow label="Total Revenue" value={totalRevenue} color="#EDF2FF" />
      </div>

      {/* Cost of Sales */}
      <div style={SECTION}>
        <div style={SB_LABEL}>Cost of Sales</div>
        {incomeStatement.costOfSales.map(line => (
          <MCard
            key={line.id}
            name={line.label}
            value={getVal(line.linkedStockId)}
            accentColor="#E8B84B"
            linkedStock={stocks.find(s => s.id === line.linkedStockId) || null}
            onDelete={() => onDeleteLine('costOfSales', line.id)}
            onLinkChange={id => onUpdateLine('costOfSales', line.id, { linkedStockId: id })}
            onNameChange={v => onUpdateLine('costOfSales', line.id, { label: v })}
            stocks={stocks}
            section="costOfSales"
            lineId={line.id}
            onUpdateLine={onUpdateLine}
          />
        ))}
        <AddBtn onClick={() => onAddLine('costOfSales')} />
        <TotalRow label="Total COGS" value={totalCOGS} color="#EDF2FF" />
      </div>

      {/* Gross Profit summary */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid #1E2535' }}>
        <SummaryRow label="Gross Profit" value={grossProfit} big />
      </div>

      {/* Expenses */}
      <div style={SECTION}>
        <div style={SB_LABEL}>Expenses</div>
        {incomeStatement.expenses.map(line => (
          <MCard
            key={line.id}
            name={line.label}
            value={getVal(line.linkedStockId)}
            accentColor="#E05252"
            linkedStock={stocks.find(s => s.id === line.linkedStockId) || null}
            onDelete={() => onDeleteLine('expenses', line.id)}
            onLinkChange={id => onUpdateLine('expenses', line.id, { linkedStockId: id })}
            onNameChange={v => onUpdateLine('expenses', line.id, { label: v })}
            stocks={stocks}
            section="expenses"
            lineId={line.id}
            onUpdateLine={onUpdateLine}
          />
        ))}
        <AddBtn onClick={() => onAddLine('expenses')} />
        <TotalRow label="Total Expenses" value={totalExpenses} color="#EDF2FF" />
      </div>

      {/* Net Income summary */}
      <div style={{ padding: '8px 14px' }}>
        <SummaryRow label="Net Income" value={netIncome} big />
      </div>
    </div>
  );
}
