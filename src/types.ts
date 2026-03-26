export type Batch = {
  batchNumber: string;
  quantity: number;
  expirationDate: string;
};

export type Medication = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderThreshold: number;
  expirationDate: string;
  price: number;
  previousPrice?: number;
  priceAlertThreshold?: number;
  priceHistory?: { date: string; price: number }[];
  unit: string;
  lastUpdated: string;
  batches: Batch[];
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

export type SaleItem = {
  medicationId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export type Sale = {
  id: string;
  tokenNumber?: string;
  patientName: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'INSURANCE';
  timestamp: string;
  status: 'COMPLETED' | 'REFUNDED';
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  notes?: string;
};


export type PurchaseOrder = {
  id: string;
  supplierId: string;
  items: {
    medicationId: string;
    name: string;
    batchNumber?: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  receivedDate?: string;
};


