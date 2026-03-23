import { Stock, Flow, Position } from '@/types/model';
import { useRef, useEffect } from 'react';

interface CanvasProps {
  stocks: Stock[];
  flows: Flow[];
  selectedNodeId: string | null;
  selectedNodeType: 'stock' | 'flow' | null;
  onStockClick: (stockId: string) => void;
  onFlowClick: (flowId: string) => void;
  onCanvasClick: () => void;
  onStockDragStart: (stockId: string, offset: Position) => void;
  onStockDrag: (position: Position) => void;
  onStockDragEnd: () => void;
}

const SW = 120;   // stock width
const SH = 56;    // stock height

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function trunc(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
}

function drawStock(
  ctx: CanvasRenderingContext2D,
  stock: Stock,
  isSel: boolean
) {
  const { x, y } = stock.position;
  const cx = x + SW / 2;
  const cy = y + SH / 2;

  // Shadow
  ctx.fillStyle = 'rgba(31,71,136,0.18)';
  roundRect(ctx, x + 3, y + 3, SW, SH, 6);
  ctx.fill();

  // Body
  ctx.fillStyle = isSel ? '#1a3a6a' : '#0f1f3d';
  ctx.strokeStyle = isSel ? '#4a8af5' : '#1F4788';
  ctx.lineWidth = isSel ? 2 : 1.5;
  roundRect(ctx, x, y, SW, SH, 6);
  ctx.fill();
  ctx.stroke();

  // Fill level (liquid level inside the box)
  const ratio =
    stock.initialValue > 0
      ? Math.min(Math.max(stock.currentValue / (stock.initialValue * 2), 0), 1)
      : 0.5;
  const fillH = (SH - 4) * ratio;
  ctx.save();
  roundRect(ctx, x + 2, y + 2, SW - 4, SH - 4, 4);
  ctx.clip();
  ctx.fillStyle = 'rgba(31,71,136,0.28)';
  ctx.fillRect(x + 2, y + SH - 2 - fillH, SW - 4, fillH);
  ctx.restore();

  // Label
  ctx.fillStyle = '#A8C4F0';
  ctx.font = '600 10px "Syne", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(trunc(stock.name, 16), cx, cy - 8);

  // Value
  ctx.fillStyle = '#EDF2FF';
  ctx.font = '500 9px "DM Mono", monospace';
  ctx.fillText(stock.currentValue.toFixed(1), cx, cy + 8);
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: 'left' | 'right'
) {
  const w = 38, h = 22;
  const cx = side === 'left' ? x - w : x;
  ctx.fillStyle = 'rgba(74,86,106,0.18)';
  ctx.strokeStyle = 'rgba(74,86,106,0.45)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  roundRect(ctx, cx, y - h / 2, w, h, 11);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFlow(
  ctx: CanvasRenderingContext2D,
  flow: Flow,
  stocks: Stock[],
  isSel: boolean
) {
  const src = flow.sourceId ? stocks.find(s => s.id === flow.sourceId) : null;
  const tgt = flow.targetId ? stocks.find(s => s.id === flow.targetId) : null;

  let sx: number, sy: number, ex: number, ey: number;

  if (src) {
    sx = src.position.x + SW;
    sy = src.position.y + SH / 2;
  } else {
    sx = tgt ? tgt.position.x - 80 : 50;
    sy = tgt ? tgt.position.y + SH / 2 : 100;
  }

  if (tgt) {
    ex = tgt.position.x;
    ey = tgt.position.y + SH / 2;
  } else {
    ex = src ? src.position.x + SW + 80 : 300;
    ey = sy;
  }

  const color = isSel ? '#2ECC71' : '#27AE60';

  // Draw arrow line
  ctx.strokeStyle = color;
  ctx.lineWidth = isSel ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Arrowhead
  const dx = ex - sx, dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const aSize = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - ux * aSize + uy * aSize * 0.4, ey - uy * aSize - ux * aSize * 0.4);
  ctx.lineTo(ex - ux * aSize - uy * aSize * 0.4, ey - uy * aSize + ux * aSize * 0.4);
  ctx.closePath();
  ctx.fill();

  // Cloud nodes at boundaries
  if (!src) drawCloud(ctx, sx, sy, 'left');
  if (!tgt) drawCloud(ctx, ex, ey, 'right');

  // Valve circle at midpoint
  const mx = (sx + ex) / 2, my = (sy + ey) / 2;
  ctx.fillStyle = '#0f1f3d';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(mx, my, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Label
  const label =
    flow.rateType === 'proportional'
      ? `${flow.name} (${flow.rate}\u00d7)`
      : `${flow.name} (${flow.rate}/s)`;
  const lw = ctx.measureText(label).width + 8;
  ctx.fillStyle = 'rgba(7,10,16,0.85)';
  ctx.fillRect(mx - lw / 2, my + 12, lw, 13);
  ctx.fillStyle = '#2ECC71';
  ctx.font = '400 8px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, mx, my + 18);
}

function isNearLine(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
  thr: number = 8
): boolean {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;
  const xx = param < 0 ? x1 : param > 1 ? x2 : x1 + param * C;
  const yy = param < 0 ? y1 : param > 1 ? y2 : y1 + param * D;
  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2) < thr;
}

export default function Canvas({
  stocks,
  flows,
  selectedNodeId,
  selectedNodeType,
  onStockClick,
  onFlowClick,
  onCanvasClick,
  onStockDragStart,
  onStockDrag,
  onStockDragEnd,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state — refs to avoid re-renders
  const cam = useRef({ px: 0, py: 0, z: 1 });

  // Interaction state
  const isPan = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const isDraggingStock = useRef(false);

  // Keep latest props accessible in event handlers without stale closures
  const stocksRef = useRef(stocks);
  const flowsRef = useRef(flows);
  const selRef = useRef({ id: selectedNodeId, type: selectedNodeType });
  stocksRef.current = stocks;
  flowsRef.current = flows;
  selRef.current = { id: selectedNodeId, type: selectedNodeType };

  // Screen → world
  function s2w(sx: number, sy: number) {
    const c = cam.current;
    return { x: (sx - c.px) / c.z, y: (sy - c.py) / c.z };
  }

  function drawCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = container.clientHeight;

    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#070A10';
    ctx.fillRect(0, 0, W, H);

    const c = cam.current;
    ctx.save();
    ctx.translate(c.px, c.py);
    ctx.scale(c.z, c.z);

    // Grid
    const step = 40;
    const x0 = -c.px / c.z;
    const y0 = -c.py / c.z;
    const x1 = x0 + W / c.z;
    const y1 = y0 + H / c.z;
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1 / c.z;
    for (let gx = Math.floor(x0 / step) * step; gx <= x1; gx += step) {
      ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y1); ctx.stroke();
    }
    for (let gy = Math.floor(y0 / step) * step; gy <= y1; gy += step) {
      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
    }

    const sel = selRef.current;

    // Flows behind stocks
    flowsRef.current.forEach(flow =>
      drawFlow(ctx, flow, stocksRef.current, sel.id === flow.id && sel.type === 'flow')
    );

    // Stocks on top
    stocksRef.current.forEach(stock =>
      drawStock(ctx, stock, sel.id === stock.id && sel.type === 'stock')
    );

    ctx.restore();
  }

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => drawCanvas());
    ro.observe(container);
    drawCanvas();
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw when model or selection changes
  useEffect(() => { drawCanvas(); });

  // ── Hit tests ──────────────────────────────────────────────
  function hitStock(wx: number, wy: number): Stock | null {
    const ss = stocksRef.current;
    for (let i = ss.length - 1; i >= 0; i--) {
      const s = ss[i];
      if (wx >= s.position.x && wx <= s.position.x + SW &&
          wy >= s.position.y && wy <= s.position.y + SH) return s;
    }
    return null;
  }

  function hitFlow(wx: number, wy: number): Flow | null {
    const ss = stocksRef.current;
    for (const flow of flowsRef.current) {
      const src = flow.sourceId ? ss.find(s => s.id === flow.sourceId) : null;
      const tgt = flow.targetId ? ss.find(s => s.id === flow.targetId) : null;
      const sx2 = src ? src.position.x + SW : (tgt ? tgt.position.x - 80 : 50);
      const sy2 = src ? src.position.y + SH / 2 : (tgt ? tgt.position.y + SH / 2 : 100);
      const ex2 = tgt ? tgt.position.x : (src ? src.position.x + SW + 80 : 300);
      const ey2 = tgt ? tgt.position.y + SH / 2 : sy2;
      if (isNearLine(wx, wy, sx2, sy2, ex2, ey2)) return flow;
    }
    return null;
  }

  // ── Mouse handlers ─────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const { x: wx, y: wy } = s2w(e.clientX - rect.left, e.clientY - rect.top);

    const stock = hitStock(wx, wy);
    if (stock) {
      isDraggingStock.current = true;
      onStockClick(stock.id);
      onStockDragStart(stock.id, { x: wx - stock.position.x, y: wy - stock.position.y });
      return;
    }

    const flow = hitFlow(wx, wy);
    if (flow) { onFlowClick(flow.id); return; }

    isPan.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, px: cam.current.px, py: cam.current.py };
    onCanvasClick();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingStock.current) {
      const rect = canvas.getBoundingClientRect();
      const { x: wx, y: wy } = s2w(e.clientX - rect.left, e.clientY - rect.top);
      onStockDrag({ x: wx, y: wy });
      return;
    }

    if (isPan.current) {
      const { mx, my, px, py } = panStart.current;
      cam.current.px = px + (e.clientX - mx);
      cam.current.py = py + (e.clientY - my);
      drawCanvas();
    }
  };

  const handleMouseUp = () => {
    isDraggingStock.current = false;
    isPan.current = false;
    onStockDragEnd();
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const c = cam.current;
    // Zoom toward mouse position
    const wx = (mx - c.px) / c.z;
    const wy = (my - c.py) / c.z;
    c.z = Math.min(Math.max(c.z * factor, 0.15), 5);
    c.px = mx - wx * c.z;
    c.py = my - wy * c.z;
    drawCanvas();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#070A10', position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ display: 'block', cursor: isPan.current ? 'grab' : 'crosshair' }}
      />
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10
      }}>
        {[
          { label: '+', action: () => { cam.current.z = Math.min(cam.current.z * 1.3, 5); drawCanvas(); } },
          { label: '⊙', action: () => { cam.current.px = 0; cam.current.py = 0; cam.current.z = 1; drawCanvas(); } },
          { label: '−', action: () => { cam.current.z = Math.max(cam.current.z / 1.3, 0.15); drawCanvas(); } },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              width: 32, height: 32,
              background: '#131820', border: '1px solid #2A3550',
              borderRadius: 6, color: '#8A97B0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontFamily: 'monospace',
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#EDF2FF'; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#8A97B0'; }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
