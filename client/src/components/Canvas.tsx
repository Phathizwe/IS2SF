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

const STOCK_WIDTH = 120;
const STOCK_HEIGHT = 80;
const FLOW_ARROW_SIZE = 10;

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
  onStockDragEnd
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw flows first (so they appear behind stocks)
    flows.forEach(flow => drawFlow(ctx, flow, stocks, selectedNodeType === 'flow' && flow.id === selectedNodeId));
    
    // Draw stocks
    stocks.forEach(stock => drawStock(ctx, stock, stock.id === selectedNodeId));
    
  }, [stocks, flows, selectedNodeId]);
  
  const drawStock = (ctx: CanvasRenderingContext2D, stock: Stock, isSelected: boolean) => {
    const { x, y } = stock.position;
    
    // Draw rectangle
    ctx.fillStyle = stock.color;
    ctx.strokeStyle = isSelected ? '#000' : '#666';
    ctx.lineWidth = isSelected ? 3 : 2;
    
    ctx.fillRect(x, y, STOCK_WIDTH, STOCK_HEIGHT);
    ctx.strokeRect(x, y, STOCK_WIDTH, STOCK_HEIGHT);
    
    // Draw name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(stock.name, x + STOCK_WIDTH / 2, y + 10);
    
    // Draw current value
    ctx.font = '12px sans-serif';
    ctx.fillText(
      `${stock.currentValue.toFixed(1)}`,
      x + STOCK_WIDTH / 2,
      y + 35
    );
    
    // Draw value bar
    const barWidth = STOCK_WIDTH - 20;
    const barHeight = 10;
    const barX = x + 10;
    const barY = y + STOCK_HEIGHT - 20;
    
    const fillRatio = Math.min(stock.currentValue / (stock.initialValue * 2), 1);
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = stock.color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(barX, barY, barWidth * fillRatio, barHeight);
    ctx.globalAlpha = 1.0;
  };
  
  const drawFlow = (ctx: CanvasRenderingContext2D, flow: Flow, stocks: Stock[], isSelected: boolean) => {
    const sourceStock = flow.sourceId ? stocks.find(s => s.id === flow.sourceId) : null;
    const targetStock = flow.targetId ? stocks.find(s => s.id === flow.targetId) : null;
    
    let startX: number, startY: number, endX: number, endY: number;
    
    if (sourceStock) {
      startX = sourceStock.position.x + STOCK_WIDTH;
      startY = sourceStock.position.y + STOCK_HEIGHT / 2;
    } else {
      // External source - draw from left edge
      startX = 50;
      startY = targetStock ? targetStock.position.y + STOCK_HEIGHT / 2 : 100;
    }
    
    if (targetStock) {
      endX = targetStock.position.x;
      endY = targetStock.position.y + STOCK_HEIGHT / 2;
    } else {
      // External sink - draw to right edge
      endX = sourceStock ? sourceStock.position.x + STOCK_WIDTH + 150 : 300;
      endY = startY;
    }
    
    // Draw arrow
    ctx.strokeStyle = isSelected ? '#000' : flow.color;
    ctx.fillStyle = isSelected ? '#000' : flow.color;
    ctx.lineWidth = isSelected ? 5 : 3;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - FLOW_ARROW_SIZE * Math.cos(angle - Math.PI / 6),
      endY - FLOW_ARROW_SIZE * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - FLOW_ARROW_SIZE * Math.cos(angle + Math.PI / 6),
      endY - FLOW_ARROW_SIZE * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    
    // Draw flow name and rate
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    ctx.fillStyle = isSelected ? '#000' : '#333';
    ctx.font = isSelected ? 'bold 12px sans-serif' : '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const rateLabel = flow.rateType === 'proportional' 
      ? `${flow.name} (${flow.rate}×)` 
      : `${flow.name} (${flow.rate}/s)`;
    ctx.fillText(rateLabel, midX, midY - 5);
    
    // Draw clickable area (invisible)
    if (isSelected) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  };
  
  const isPointNearLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number = 10): boolean => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy) < threshold;
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicked on a stock
    const clickedStock = stocks.find(stock => 
      x >= stock.position.x &&
      x <= stock.position.x + STOCK_WIDTH &&
      y >= stock.position.y &&
      y <= stock.position.y + STOCK_HEIGHT
    );
    
    if (clickedStock) {
      onStockClick(clickedStock.id);
      onStockDragStart(clickedStock.id, {
        x: x - clickedStock.position.x,
        y: y - clickedStock.position.y
      });
      return;
    }
    
    // Check if clicked on a flow
    const clickedFlow = flows.find(flow => {
      const sourceStock = flow.sourceId ? stocks.find(s => s.id === flow.sourceId) : null;
      const targetStock = flow.targetId ? stocks.find(s => s.id === flow.targetId) : null;
      
      let startX: number, startY: number, endX: number, endY: number;
      
      if (sourceStock) {
        startX = sourceStock.position.x + STOCK_WIDTH;
        startY = sourceStock.position.y + STOCK_HEIGHT / 2;
      } else {
        startX = 50;
        startY = targetStock ? targetStock.position.y + STOCK_HEIGHT / 2 : 100;
      }
      
      if (targetStock) {
        endX = targetStock.position.x;
        endY = targetStock.position.y + STOCK_HEIGHT / 2;
      } else {
        endX = sourceStock ? sourceStock.position.x + STOCK_WIDTH + 150 : 300;
        endY = startY;
      }
      
      return isPointNearLine(x, y, startX, startY, endX, endY);
    });
    
    if (clickedFlow) {
      onFlowClick(clickedFlow.id);
    } else {
      onCanvasClick();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onStockDrag({ x, y });
  };
  
  const handleMouseUp = () => {
    onStockDragEnd();
  };
  
  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-crosshair"
      />
    </div>
  );
}

