import { Play, Pause, RotateCcw, Plus, Download, Upload, FileText, FileUp } from 'lucide-react';

interface ToolbarProps {
  isSimulating: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onAddStock: () => void;
  onAddFlow: () => void;
  onExport: () => void;
  onImport: () => void;
  onLoadTemplate: () => void;
  onUploadDocument: () => void;
  currentTime: number;
}

const BTN_BASE: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '5px 10px', borderRadius: 5, cursor: 'pointer',
  fontFamily: '"DM Mono", monospace', fontSize: 10, fontWeight: 500,
  border: '1px solid #2A3550', background: '#171D28', color: '#8A97B0',
  transition: 'all 0.15s',
};
const BTN_PRIMARY: React.CSSProperties = {
  ...BTN_BASE,
  background: 'linear-gradient(135deg,#1F4788 0%,#2D5FAA 100%)',
  borderColor: '#2D5FAA', color: '#EDF2FF',
};

function Btn({
  style, onClick, children
}: { style?: React.CSSProperties; onClick?: () => void; children: React.ReactNode }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      style={{ ...BTN_BASE, ...(hov ? { background: '#1E2535', color: '#EDF2FF' } : {}), ...style }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button
      style={{ ...BTN_PRIMARY, ...(hov ? { filter: 'brightness(1.15)' } : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

import React from 'react';

export default function Toolbar({
  isSimulating,
  onPlayPause,
  onReset,
  onAddStock,
  onAddFlow,
  onExport,
  onImport,
  onLoadTemplate,
  onUploadDocument,
  currentTime,
}: ToolbarProps) {
  return (
    <div style={{
      height: 54, padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: 'linear-gradient(135deg,#1F4788 40%,#27AE60 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Syne",sans-serif', fontWeight: 700, fontSize: 12, color: '#fff',
          flexShrink: 0,
        }}>
          S<span style={{ color: '#2ECC71' }}>F</span>
        </div>
        <div>
          <div style={{ fontFamily: '"Syne",sans-serif', fontSize: 14, fontWeight: 700, color: '#EDF2FF', lineHeight: 1.2 }}>
            Financial Stocks &amp; <span style={{ color: '#27AE60' }}>Flows</span> Modeller
          </div>
          <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A566A', lineHeight: 1 }}>
            SYSTEM DYNAMICS · ANNUAL REPORT ANALYSIS · JSE / IFRS
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Time */}
        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: '#4A566A', marginRight: 4 }}>
          t={currentTime.toFixed(1)}s
        </span>

        {/* Sim controls */}
        <div style={{ display: 'flex', gap: 4, paddingRight: 10, borderRight: '1px solid #1E2535' }}>
          <PrimaryBtn onClick={onPlayPause}>
            {isSimulating
              ? <><Pause size={11} /><span>Pause</span></>
              : <><Play size={11} /><span>Play</span></>
            }
          </PrimaryBtn>
          <Btn onClick={onReset}>
            <RotateCcw size={11} /><span>Reset</span>
          </Btn>
        </div>

        {/* Add elements */}
        <div style={{ display: 'flex', gap: 4, paddingRight: 10, borderRight: '1px solid #1E2535' }}>
          <Btn onClick={onAddStock}>
            <Plus size={11} /><span>Stock</span>
          </Btn>
          <Btn onClick={onAddFlow}>
            <Plus size={11} /><span>Flow</span>
          </Btn>
        </div>

        {/* File ops */}
        <div style={{ display: 'flex', gap: 4 }}>
          <PrimaryBtn onClick={onUploadDocument}>
            <FileUp size={11} /><span>Upload</span>
          </PrimaryBtn>
          <Btn onClick={onLoadTemplate}>
            <FileText size={11} /><span>Templates</span>
          </Btn>
          <Btn onClick={onImport}>
            <Upload size={11} /><span>Import</span>
          </Btn>
          <Btn onClick={onExport}>
            <Download size={11} /><span>Export</span>
          </Btn>
        </div>
      </div>
    </div>
  );
}
