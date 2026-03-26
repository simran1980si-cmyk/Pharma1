-- Supabase Schema for Pharmacy Management System

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 0,
  expiration_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  previous_price DECIMAL(10, 2),
  price_alert_threshold DECIMAL(3, 2) DEFAULT 0.1,
  unit TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  price_history JSONB DEFAULT '[]'::jsonb,
  batches JSONB DEFAULT '[]'::jsonb
);

-- Inventory Logs table
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id),
  type TEXT CHECK (type IN ('IN', 'OUT', 'ADJUST')),
  quantity INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reason TEXT
);

-- Tokens table
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  token_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_number TEXT,
  patient_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('CASH', 'CARD', 'INSURANCE')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status TEXT CHECK (status IN ('COMPLETED', 'REFUNDED'))
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT
);

-- Purchase Orders table
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED')),
  order_date DATE NOT NULL,
  received_date DATE
);
