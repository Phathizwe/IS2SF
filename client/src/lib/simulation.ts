import { Stock, Flow, Model } from '@/types/model';

/**
 * Calculate the net flow for a stock based on all connected flows
 */
export function calculateNetFlow(stockId: string, flows: Flow[]): number {
  let netFlow = 0;
  
  flows.forEach(flow => {
    if (flow.targetId === stockId) {
      netFlow += flow.rate;
    }
    if (flow.sourceId === stockId) {
      netFlow -= flow.rate;
    }
  });
  
  return netFlow;
}

/**
 * Update stock values based on flows for one time step
 */
export function simulateStep(model: Model): Model {
  const updatedStocks = model.stocks.map(stock => {
    const netFlow = calculateNetFlow(stock.id, model.flows);
    const newValue = Math.max(0, stock.currentValue + netFlow * model.timeStep);
    
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

