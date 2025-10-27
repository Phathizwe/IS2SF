import { Model } from '@/types/model';

export const templates: Record<string, Model> = {
  'customer-growth': {
    id: 'template-customer-growth',
    name: 'Customer Growth Model',
    stocks: [
      {
        id: 'stock-prospects',
        name: 'Prospects',
        position: { x: 100, y: 200 },
        initialValue: 1000,
        currentValue: 1000,
        color: '#93c5fd'
      },
      {
        id: 'stock-customers',
        name: 'Customers',
        position: { x: 400, y: 200 },
        initialValue: 100,
        currentValue: 100,
        color: '#3b82f6'
      }
    ],
    flows: [
      {
        id: 'flow-marketing',
        name: 'Marketing',
        sourceId: null,
        targetId: 'stock-prospects',
        rate: 50,
        rateType: 'absolute' as const,
        color: '#8b5cf6'
      },
      {
        id: 'flow-conversion',
        name: 'Conversion',
        sourceId: 'stock-prospects',
        targetId: 'stock-customers',
        rate: 0.01,
        rateType: 'proportional' as const,
        color: '#10b981'
      },
      {
        id: 'flow-churn',
        name: 'Churn',
        sourceId: 'stock-customers',
        targetId: null,
        rate: 0.05,
        rateType: 'proportional' as const,
        color: '#ef4444'
      }
    ],
    timeStep: 0.1,
    currentTime: 0
  },
  
  'inventory-management': {
    id: 'template-inventory',
    name: 'Inventory Management',
    stocks: [
      {
        id: 'stock-raw',
        name: 'Raw Materials',
        position: { x: 100, y: 200 },
        initialValue: 500,
        currentValue: 500,
        color: '#a78bfa'
      },
      {
        id: 'stock-wip',
        name: 'Work in Progress',
        position: { x: 350, y: 200 },
        initialValue: 200,
        currentValue: 200,
        color: '#fbbf24'
      },
      {
        id: 'stock-finished',
        name: 'Finished Goods',
        position: { x: 600, y: 200 },
        initialValue: 100,
        currentValue: 100,
        color: '#10b981'
      }
    ],
    flows: [
      {
        id: 'flow-procurement',
        name: 'Procurement',
        sourceId: null,
        targetId: 'stock-raw',
        rate: 20,
        rateType: 'absolute' as const,
        color: '#6366f1'
      },
      {
        id: 'flow-production-start',
        name: 'Production Start',
        sourceId: 'stock-raw',
        targetId: 'stock-wip',
        rate: 0.03,
        rateType: 'proportional' as const,
        color: '#f59e0b'
      },
      {
        id: 'flow-production-complete',
        name: 'Production Complete',
        sourceId: 'stock-wip',
        targetId: 'stock-finished',
        rate: 0.06,
        rateType: 'proportional' as const,
        color: '#14b8a6'
      },
      {
        id: 'flow-sales',
        name: 'Sales',
        sourceId: 'stock-finished',
        targetId: null,
        rate: 0.1,
        rateType: 'proportional' as const,
        color: '#22c55e'
      }
    ],
    timeStep: 0.1,
    currentTime: 0
  },
  
  'cash-flow': {
    id: 'template-cash',
    name: 'Cash Flow Model',
    stocks: [
      {
        id: 'stock-cash',
        name: 'Cash',
        position: { x: 300, y: 150 },
        initialValue: 10000,
        currentValue: 10000,
        color: '#10b981'
      },
      {
        id: 'stock-ar',
        name: 'Accounts Receivable',
        position: { x: 600, y: 150 },
        initialValue: 5000,
        currentValue: 5000,
        color: '#3b82f6'
      }
    ],
    flows: [
      {
        id: 'flow-revenue',
        name: 'Revenue',
        sourceId: null,
        targetId: 'stock-ar',
        rate: 100,
        rateType: 'absolute' as const,
        color: '#22c55e'
      },
      {
        id: 'flow-collection',
        name: 'Collections',
        sourceId: 'stock-ar',
        targetId: 'stock-cash',
        rate: 0.016,
        rateType: 'proportional' as const,
        color: '#14b8a6'
      },
      {
        id: 'flow-expenses',
        name: 'Operating Expenses',
        sourceId: 'stock-cash',
        targetId: null,
        rate: 60,
        rateType: 'absolute' as const,
        color: '#ef4444'
      }
    ],
    timeStep: 0.1,
    currentTime: 0
  }
};

export const templateList = [
  { id: 'customer-growth', name: 'Customer Growth Model', description: 'Model customer acquisition and churn' },
  { id: 'inventory-management', name: 'Inventory Management', description: 'Track materials through production' },
  { id: 'cash-flow', name: 'Cash Flow Model', description: 'Monitor cash and receivables' }
];

