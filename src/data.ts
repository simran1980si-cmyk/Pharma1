import { Medication } from './types';

export const MOCK_MEDICATIONS: Medication[] = [
  { 
    id: '1', 
    name: 'Amoxicillin 500mg', 
    category: 'Antibiotics', 
    stock: 15, 
    reorderThreshold: 20, 
    expirationDate: '2026-05-15', 
    price: 12.50, 
    previousPrice: 10.00,
    priceAlertThreshold: 0.1,
    unit: 'Capsules', 
    lastUpdated: '2026-03-25',
    batches: [
      { batchNumber: 'BAT-001', quantity: 10, expirationDate: '2026-05-15' },
      { batchNumber: 'BAT-002', quantity: 5, expirationDate: '2026-06-20' }
    ]
  },
  { 
    id: '2', 
    name: 'Lisinopril 10mg', 
    category: 'Hypertension', 
    stock: 120, 
    reorderThreshold: 50, 
    expirationDate: '2027-01-10', 
    price: 8.00, 
    previousPrice: 9.50,
    priceAlertThreshold: 0.1,
    unit: 'Tablets', 
    lastUpdated: '2026-03-24',
    batches: [
      { batchNumber: 'BAT-003', quantity: 120, expirationDate: '2027-01-10' }
    ]
  },
  { 
    id: '3', 
    name: 'Atorvastatin 20mg', 
    category: 'Cholesterol', 
    stock: 8, 
    reorderThreshold: 30, 
    expirationDate: '2026-04-01', 
    price: 15.20, 
    priceAlertThreshold: 0.1,
    unit: 'Tablets', 
    lastUpdated: '2026-03-26',
    batches: [
      { batchNumber: 'BAT-004', quantity: 8, expirationDate: '2026-04-01' }
    ]
  },
  { 
    id: '4', 
    name: 'Metformin 500mg', 
    category: 'Diabetes', 
    stock: 250, 
    reorderThreshold: 100, 
    expirationDate: '2026-12-20', 
    price: 5.50, 
    priceAlertThreshold: 0.1,
    unit: 'Tablets', 
    lastUpdated: '2026-03-20',
    batches: [
      { batchNumber: 'BAT-005', quantity: 250, expirationDate: '2026-12-20' }
    ]
  },
  { 
    id: '5', 
    name: 'Ibuprofen 400mg', 
    category: 'Pain Relief', 
    stock: 45, 
    reorderThreshold: 50, 
    expirationDate: '2026-03-30', 
    price: 6.75, 
    priceAlertThreshold: 0.1,
    unit: 'Tablets', 
    lastUpdated: '2026-03-22',
    batches: [
      { batchNumber: 'BAT-006', quantity: 45, expirationDate: '2026-03-30' }
    ]
  },
];
