import { Stock, Flow, Model } from '@/types/model';

/**
 * Calculate the actual flow rate based on source stock availability and rate type
 * - Absolute flows: fixed rate regardless of source quantity
 * - Proportional flows: rate multiplied by source stock quantity
 */
export function calculateActualFlowRate(flow: Flow, stocks: Stock[]): number {
  // If there's no source (external source), use the full rate
  if (!flow.sourceId) {
    return flow.rate;
  }
  
  // Find the source stock
  const sourceStock = stocks.find(s => s.id === flow.sourceId);
  if (!sourceStock) {
    return 0;
  }
  
  // If source stock is empty or negative, no flow can occur
  if (sourceStock.currentValue <= 0) {
    return 0;
  }
  
  // Calculate rate based on type
  if (flow.rateType === 'proportional') {
    // Proportional: rate per unit of source stock
    // Example: 0.1 rate with 100 customers = 10 units/time
    return flow.rate * sourceStock.currentValue;
  } else {
    // Absolute: fixed rate, but limited by available stock
    return flow.rate;
  }
}

/**
 * Calculate the net flow for a stock based on all connected flows
 */
export function calculateNetFlow(stockId: string, flows: Flow[], stocks: Stock[]): number {
  let netFlow = 0;
  
  flows.forEach(flow => {
    const actualRate = calculateActualFlowRate(flow, stocks);
    
    if (flow.targetId === stockId) {
      netFlow += actualRate;
    }
    if (flow.sourceId === stockId) {
      netFlow -= actualRate;
    }
  });
  
  return netFlow;
}

/**
 * Update stock values based on flows for one time step
 */
export function simulateStep(model: Model): Model {
  const updatedStocks = model.stocks.map(stock => {
    const netFlow = calculateNetFlow(stock.id, model.flows, model.stocks);
    const deltaValue = netFlow * model.timeStep;
    
    // Calculate new value, ensuring it doesn't go below zero
    let newValue = stock.currentValue + deltaValue;
    
    // If the stock would go negative, limit outflows
    if (newValue < 0) {
      // Calculate how much can actually flow out
      const outflows = model.flows.filter(f => f.sourceId === stock.id);
      const totalOutflowRate = outflows.reduce((sum, flow) => {
        return sum + calculateActualFlowRate(flow, model.stocks);
      }, 0);
      
      const inflows = model.flows.filter(f => f.targetId === stock.id);
      const totalInflowRate = inflows.reduce((sum, flow) => {
        return sum + calculateActualFlowRate(flow, model.stocks);
      }, 0);
      
      // Limit to available stock
      const maxOutflow = stock.currentValue / model.timeStep;
      const actualOutflow = Math.min(totalOutflowRate, maxOutflow);
      const actualNetFlow = totalInflowRate - actualOutflow;
      
      newValue = Math.max(0, stock.currentValue + actualNetFlow * model.timeStep);
    }
    
    return {
      ...stock,
      currentValue: newValue
    };
  });
  
  return {
    ...model,
    stocks: updatedStocks,
    currentTime: model.currentTime + model.timeStep
  };
}

/**
 * Reset simulation to initial state
 */
export function resetSimulation(model: Model): Model {
  const resetStocks = model.stocks.map(stock => ({
    ...stock,
    currentValue: stock.initialValue
  }));
  
  return {
    ...model,
    stocks: resetStocks,
    currentTime: 0
  };
}

/**
 * Evaluate a formula string (basic implementation)
 * In a production app, you'd want a proper expression parser
 */
export function evaluateFormula(formula: string, context: Record<string, number>): number {
  try {
    // Simple replacement of variables
    let evaluatedFormula = formula;
    Object.keys(context).forEach(key => {
      evaluatedFormula = evaluatedFormula.replace(new RegExp(key, 'g'), String(context[key]));
    });
    
    // Use Function constructor for safe evaluation (limited scope)
    const result = new Function(`return ${evaluatedFormula}`)();
    return typeof result === 'number' ? result : 0;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return 0;
  }
}

