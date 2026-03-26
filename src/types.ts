export type Medication = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderThreshold: number;
  expirationDate: string;
  price: number;
  unit: string;
  lastUpdated: string;
};

export type InventoryLog = {
  id: string;
  medicationId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  timestamp: string;
  reason?: string;
};

export type Token = {
  id: string;
  patientName: string;
  tokenNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
};
