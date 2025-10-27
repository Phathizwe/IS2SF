import { useState, useEffect, useRef } from 'react';
import { Stock, Flow, Model, DragState, Position } from '@/types/model';
import { simulateStep, resetSimulation } from '@/lib/simulation';
import Canvas from '@/components/Canvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import Toolbar from '@/components/Toolbar';
import FlowDialog from '@/components/FlowDialog';
import TemplateDialog from '@/components/TemplateDialog';
import { templates } from '@/lib/templates';
import { toast } from 'sonner';

const INITIAL_MODEL: Model = {
  id: 'model-1',
  name: 'Business Model',
  stocks: [
    {
      id: 'stock-1',
      name: 'Customers',
      position: { x: 200, y: 200 },
      initialValue: 100,
      currentValue: 100,
      color: '#3b82f6'
    },
    {
      id: 'stock-2',
      name: 'Revenue',
      position: { x: 500, y: 200 },
      initialValue: 0,
      currentValue: 0,
      color: '#10b981'
    }
  ],
  flows: [
    {
      id: 'flow-1',
      name: 'New Customers',
      sourceId: null,
      targetId: 'stock-1',
      rate: 5,
      rateType: 'absolute' as const,
      color: '#6366f1'
    },
    {
      id: 'flow-2',
      name: 'Churn',
      sourceId: 'stock-1',
      targetId: null,
      rate: 0.02,
      rateType: 'proportional' as const,
      color: '#ef4444'
    },
    {
      id: 'flow-3',
      name: 'Sales',
      sourceId: 'stock-1',
      targetId: 'stock-2',
      rate: 0.1,
      rateType: 'proportional' as const,
      color: '#f59e0b'
    }
  ],
  timeStep: 0.1,
  currentTime: 0
};

export default function Home() {
  const [model, setModel] = useState<Model>(INITIAL_MODEL);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<'stock' | 'flow' | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    nodeType: null,
    offset: { x: 0, y: 0 }
  });
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation loop
  useEffect(() => {
    if (isSimulating) {
      simulationIntervalRef.current = setInterval(() => {
        setModel(prevModel => simulateStep(prevModel));
      }, 100); // Update every 100ms
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulating]);

  const handlePlayPause = () => {
    setIsSimulating(!isSimulating);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setModel(resetSimulation(model));
    toast.success('Simulation reset');
  };

  const handleAddStock = () => {
    const newStock: Stock = {
      id: `stock-${Date.now()}`,
      name: `Stock ${model.stocks.length + 1}`,
      position: { x: 100 + model.stocks.length * 50, y: 100 + model.stocks.length * 50 },
      initialValue: 50,
      currentValue: 50,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    
    setModel({
      ...model,
      stocks: [...model.stocks, newStock]
    });
    toast.success('Stock added');
  };

  const handleAddFlow = () => {
    setFlowDialogOpen(true);
  };

  const handleCreateFlow = (flowData: Omit<Flow, 'id'>) => {
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      ...flowData
    };
    
    setModel({
      ...model,
      flows: [...model.flows, newFlow]
    });
    toast.success('Flow created');
  };

  const handleStockUpdate = (updatedStock: Stock) => {
    setModel({
      ...model,
      stocks: model.stocks.map(s => s.id === updatedStock.id ? updatedStock : s)
    });
  };

  const handleFlowUpdate = (updatedFlow: Flow) => {
    setModel({
      ...model,
      flows: model.flows.map(f => f.id === updatedFlow.id ? updatedFlow : f)
    });
  };

  const handleStockDelete = (stockId: string) => {
    setModel({
      ...model,
      stocks: model.stocks.filter(s => s.id !== stockId),
      flows: model.flows.filter(f => f.sourceId !== stockId && f.targetId !== stockId)
    });
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    toast.success('Stock deleted');
  };

  const handleFlowDelete = (flowId: string) => {
    setModel({
      ...model,
      flows: model.flows.filter(f => f.id !== flowId)
    });
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    toast.success('Flow deleted');
  };

  const handleStockClick = (stockId: string) => {
    setSelectedNodeId(stockId);
    setSelectedNodeType('stock');
  };

  const handleFlowClick = (flowId: string) => {
    setSelectedNodeId(flowId);
    setSelectedNodeType('flow');
  };

  const handleCanvasClick = () => {
    setSelectedNodeId(null);
    setSelectedNodeType(null);
  };

  const handleStockDragStart = (stockId: string, offset: Position) => {
    setDragState({
      isDragging: true,
      nodeId: stockId,
      nodeType: 'stock',
      offset
    });
  };

  const handleStockDrag = (position: Position) => {
    if (dragState.isDragging && dragState.nodeId && dragState.nodeType === 'stock') {
      const newX = position.x - dragState.offset.x;
      const newY = position.y - dragState.offset.y;
      
      setModel({
        ...model,
        stocks: model.stocks.map(s => 
          s.id === dragState.nodeId 
            ? { ...s, position: { x: newX, y: newY } }
            : s
        )
      });
    }
  };

  const handleStockDragEnd = () => {
    setDragState({
      isDragging: false,
      nodeId: null,
      nodeType: null,
      offset: { x: 0, y: 0 }
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(model, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stocks-flows-model.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Model exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedModel = JSON.parse(event.target?.result as string);
            setModel(importedModel);
            toast.success('Model imported');
          } catch (error) {
            toast.error('Invalid model file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleLoadTemplate = () => {
    setTemplateDialogOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates[templateId];
    if (template) {
      setModel(template);
      setIsSimulating(false);
      toast.success('Template loaded');
    }
  };

  const selectedStock = selectedNodeType === 'stock' ? model.stocks.find(s => s.id === selectedNodeId) || null : null;
  const selectedFlow = selectedNodeType === 'flow' ? model.flows.find(f => f.id === selectedNodeId) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="p-4">
        <Toolbar
          isSimulating={isSimulating}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onAddStock={handleAddStock}
          onAddFlow={handleAddFlow}
          onExport={handleExport}
          onImport={handleImport}
          onLoadTemplate={handleLoadTemplate}
          currentTime={model.currentTime}
        />
      </div>
      
      <div className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden">
        <FlowDialog
          open={flowDialogOpen}
          onOpenChange={setFlowDialogOpen}
          stocks={model.stocks}
          onCreateFlow={handleCreateFlow}
        />
        <TemplateDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={handleSelectTemplate}
        />
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <Canvas
            stocks={model.stocks}
            flows={model.flows}
            selectedNodeId={selectedNodeId}
            selectedNodeType={selectedNodeType}
            onStockClick={handleStockClick}
            onFlowClick={handleFlowClick}
            onCanvasClick={handleCanvasClick}
            onStockDragStart={handleStockDragStart}
            onStockDrag={handleStockDrag}
            onStockDragEnd={handleStockDragEnd}
          />
        </div>
        
        <div className="w-80">
          <PropertiesPanel
            selectedStock={selectedStock}
            selectedFlow={selectedFlow}
            stocks={model.stocks}
            onStockUpdate={handleStockUpdate}
            onFlowUpdate={handleFlowUpdate}
            onStockDelete={handleStockDelete}
            onFlowDelete={handleFlowDelete}
          />
        </div>
      </div>
    </div>
  );
}

