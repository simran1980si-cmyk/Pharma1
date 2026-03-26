import { supabase } from '../supabase';
import { Medication, Supplier, PurchaseOrder, Token, Sale } from '../types';

// Helper to convert snake_case to camelCase
const toCamel = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (typeof obj !== 'object') return obj;
  
  const n: any = {};
  Object.keys(obj).forEach(k => {
    const newK = k.replace(/(_\w)/g, m => m[1].toUpperCase());
    n[newK] = toCamel(obj[k]);
  });
  return n;
};

// Helper to convert camelCase to snake_case
const toSnake = (obj: any) => {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (typeof obj !== 'object') return obj;
  
  const n: any = {};
  Object.keys(obj).forEach(k => {
    const newK = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    n[newK] = toSnake(obj[k]);
  });
  return n;
};

export const supabaseService = {
  // Medications
  async getMedications(): Promise<Medication[]> {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name');
    if (error) throw error;
    return toCamel(data) as Medication[];
  },

  async updateMedication(id: string, updates: Partial<Medication>) {
    const snakeUpdates = toSnake(updates);
    const { data, error } = await supabase
      .from('medications')
      .update(snakeUpdates)
      .eq('id', id);
    if (error) throw error;
    return toCamel(data);
  },

  async addMedication(medication: Omit<Medication, 'id'>) {
    const snakeMed = toSnake(medication);
    const { data, error } = await supabase
      .from('medications')
      .insert([snakeMed]);
    if (error) throw error;
    return toCamel(data);
  },

  async deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (error) throw error;
    return toCamel(data) as Supplier[];
  },

  async addSupplier(supplier: Omit<Supplier, 'id'>) {
    const snakeSupplier = toSnake(supplier);
    const { data, error } = await supabase
      .from('suppliers')
      .insert([snakeSupplier]);
    if (error) throw error;
    return toCamel(data);
  },

  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const snakeUpdates = toSnake(updates);
    const { data, error } = await supabase
      .from('suppliers')
      .update(snakeUpdates)
      .eq('id', id);
    if (error) throw error;
    return toCamel(data);
  },

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('order_date', { ascending: false });
    if (error) throw error;
    return toCamel(data) as PurchaseOrder[];
  },

  async addPurchaseOrder(order: Omit<PurchaseOrder, 'id'>) {
    const snakeOrder = toSnake(order);
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([snakeOrder]);
    if (error) throw error;
    return toCamel(data);
  },

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status'], receivedDate?: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status, received_date: receivedDate })
      .eq('id', id);
    if (error) throw error;
    return toCamel(data);
  },

  // Tokens
  async getTokens(): Promise<Token[]> {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return toCamel(data) as Token[];
  },

  async addToken(token: Omit<Token, 'id'>) {
    const snakeToken = toSnake(token);
    const { data, error } = await supabase
      .from('tokens')
      .insert([snakeToken]);
    if (error) throw error;
    return toCamel(data);
  },

  async updateTokenStatus(id: string, status: Token['status']) {
    const { data, error } = await supabase
      .from('tokens')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return toCamel(data);
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return toCamel(data) as Sale[];
  },

  async addSale(sale: Omit<Sale, 'id'>) {
    const snakeSale = toSnake(sale);
    const { data, error } = await supabase
      .from('sales')
      .insert([snakeSale]);
    if (error) throw error;
    return toCamel(data);
  }
};
