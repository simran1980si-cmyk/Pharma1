import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Package,
  Building2,
  Mail,
  Phone,
  ArrowRight,
  Trash2,
  Minus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Supplier, PurchaseOrder, Medication } from '../types';
import { MOCK_MEDICATIONS } from '../data';

const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Global Pharma Corp', contactPerson: 'Alice Smith', email: 'alice@globalpharma.com', phone: '+1 234 567 890', category: 'General', address: '123 Pharma Way, New York, NY 10001', notes: 'Primary supplier for generic medications. Reliable delivery.' },
  { id: '2', name: 'MediSupply Inc', contactPerson: 'Bob Wilson', email: 'bob@medisupply.com', phone: '+1 987 654 321', category: 'Specialized', address: '456 Medical Blvd, Chicago, IL 60601', notes: 'Specializes in high-end medical equipment and rare drugs.' },
  { id: '3', name: 'LifeCare Logistics', contactPerson: 'Charlie Brown', email: 'charlie@lifecare.com', phone: '+1 555 123 456', category: 'Antibiotics', address: '789 Health St, San Francisco, CA 94101', notes: 'Fastest delivery for urgent antibiotic orders.' },
];

const MOCK_ORDERS: PurchaseOrder[] = [
  { id: 'PO-001', supplierId: '1', items: [{ medicationId: '1', name: 'Amoxicillin', quantity: 500, unitPrice: 10 }], totalAmount: 5000, status: 'RECEIVED', orderDate: '2026-03-10', receivedDate: '2026-03-15' },
  { id: 'PO-002', supplierId: '2', items: [{ medicationId: '2', name: 'Lisinopril', quantity: 1000, unitPrice: 5 }], totalAmount: 5000, status: 'ORDERED', orderDate: '2026-03-20' },
  { id: 'PO-003', supplierId: '3', items: [{ medicationId: '3', name: 'Atorvastatin', quantity: 200, unitPrice: 12 }], totalAmount: 2400, status: 'PENDING', orderDate: '2026-03-25' },
];

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>(MOCK_ORDERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    orderDate: format(new Date(), 'yyyy-MM-dd'),
    items: [{ medicationId: '', name: '', batchNumber: '', quantity: 1, unitPrice: 0 }]
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'General',
    address: '',
    notes: ''
  });

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category,
      address: supplier.address,
      notes: supplier.notes || ''
    });
    setShowSupplierModal(true);
  };

  const resetSupplierForm = () => {
    setShowSupplierModal(false);
    setEditingSupplier(null);
    setNewSupplier({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      category: 'General',
      address: '',
      notes: ''
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suppliers.find(s => s.id === order.supplierId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery, suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, suppliers]);

  const getStatusConfig = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'PENDING': return { label: 'Draft', color: 'text-gray-600 bg-gray-100', icon: FileText };
      case 'ORDERED': return { label: 'In Transit', color: 'text-blue-600 bg-blue-50', icon: Clock };
      case 'RECEIVED': return { label: 'Received', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle };
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Warehouse & Procurement</h2>
          <p className="text-gray-500 mt-1">Manage bulk orders and supplier relationships.</p>
        </div>
        <button 
          onClick={() => activeTab === 'orders' ? setShowOrderModal(true) : setShowSupplierModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'orders' ? 'New Purchase Order' : 'Add Supplier'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === 'orders' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Purchase Orders
        </button>
        <button 
          onClick={() => setActiveTab('suppliers')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            activeTab === 'suppliers' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:text-gray-900"
          )}
        >
          Suppliers
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder={activeTab === 'orders' ? "Search orders or suppliers..." : "Search suppliers or contacts..."}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {activeTab === 'orders' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const supplier = suppliers.find(s => s.id === order.supplierId);
                  const config = getStatusConfig(order.status);
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                            <span className="font-bold text-blue-600 text-sm">{order.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{supplier?.name}</div>
                          <div className="text-xs text-gray-500">{supplier?.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">{order.items.length} items</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">
                            {order.items.map(i => i.name).join(', ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                          ${order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.orderDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit", config.color)}>
                            <config.icon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <ArrowRight className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-90")} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/30">
                          <td colSpan={7} className="px-12 py-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                  <Package className="w-3 h-3" />
                                  Order Items Details
                                </div>
                                <div className="text-xs text-gray-400">
                                  Total Items: {order.items.length}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs text-gray-500 font-mono">ID: {item.medicationId}</p>
                                          {item.batchNumber && (
                                            <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Batch: {item.batchNumber}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                      <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Quantity</p>
                                        <p className="text-sm font-bold text-gray-900">{item.quantity.toLocaleString()}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Unit Price</p>
                                        <p className="text-sm font-bold text-gray-900">${item.unitPrice.toFixed(2)}</p>
                                      </div>
                                      <div className="text-right min-w-[100px]">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Subtotal</p>
                                        <p className="text-sm font-bold text-blue-600">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {supplier.category}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1">{supplier.name}</h4>
                <p className="text-sm text-gray-500 mb-6">{supplier.contactPerson}</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {supplier.phone}
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                </div>

                {supplier.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Special Notes</p>
                    <p className="text-xs text-gray-600 italic line-clamp-2">"{supplier.notes}"</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                    <Package className="w-4 h-4" />
                    12 Active Orders
                  </div>
                  <button 
                    onClick={() => handleEditSupplier(supplier)}
                    className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Purchase Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Create New Purchase Order</h3>
            </div>
            
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const total = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const order: PurchaseOrder = {
                id: `PO-${(orders.length + 1).toString().padStart(3, '0')}`,
                supplierId: newOrder.supplierId,
                items: newOrder.items,
                totalAmount: total,
                status: 'PENDING',
                orderDate: newOrder.orderDate
              };
              setOrders(prev => [order, ...prev]);
              setShowOrderModal(false);
              setNewOrder({
                supplierId: '',
                orderDate: format(new Date(), 'yyyy-MM-dd'),
                items: [{ medicationId: '', name: '', batchNumber: '', quantity: 1, unitPrice: 0 }]
              });
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Supplier</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newOrder.supplierId}
                    onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Order Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newOrder.orderDate}
                    onChange={(e) => setNewOrder({...newOrder, orderDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              {newOrder.supplierId && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Supplier Notes (Read-only)</label>
                  <div className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100/50 rounded-xl text-xs text-gray-600 italic">
                    {suppliers.find(s => s.id === newOrder.supplierId)?.notes || "No special notes for this supplier."}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Items</label>
                  <button 
                    type="button"
                    onClick={() => setNewOrder({
                      ...newOrder, 
                      items: [...newOrder.items, { medicationId: '', name: '', batchNumber: '', quantity: 1, unitPrice: 0 }]
                    })}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newOrder.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded-xl">
                      <div className="col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Medication</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.medicationId}
                          onChange={(e) => {
                            const selectedMed = MOCK_MEDICATIONS.find(m => m.id === e.target.value);
                            const newItems = [...newOrder.items];
                            newItems[idx].medicationId = e.target.value;
                            newItems[idx].name = selectedMed?.name || '';
                            newItems[idx].unitPrice = selectedMed?.price || 0;
                            setNewOrder({...newOrder, items: newItems});
                          }}
                          required
                        >
                          <option value="">Select Medication</option>
                          {MOCK_MEDICATIONS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Batch #</label>
                        <input 
                          type="text" 
                          placeholder="B-001"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.batchNumber}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].batchNumber = e.target.value;
                            setNewOrder({...newOrder, items: newItems});
                          }}
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].quantity = Number(e.target.value);
                            setNewOrder({...newOrder, items: newItems});
                          }}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...newOrder.items];
                            newItems[idx].unitPrice = Number(e.target.value);
                            setNewOrder({...newOrder, items: newItems});
                          }}
                          required
                        />
                      </div>
                      <div className="col-span-2 pb-1">
                        <button 
                          type="button"
                          onClick={() => {
                            if (newOrder.items.length === 1) return;
                            const newItems = newOrder.items.filter((_, i) => i !== idx);
                            setNewOrder({...newOrder, items: newItems});
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Estimated Amount</p>
                  <p className="text-2xl font-black text-gray-900">
                    ${newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
            </div>
            
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              if (editingSupplier) {
                const updatedSupplier: Supplier = {
                  ...editingSupplier,
                  ...newSupplier
                };
                setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
              } else {
                const supplier: Supplier = {
                  id: (suppliers.length + 1).toString(),
                  ...newSupplier
                };
                setSuppliers(prev => [supplier, ...prev]);
              }
              resetSupplierForm();
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Supplier Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                    required
                  >
                    <option value="General">General</option>
                    <option value="Specialized">Specialized</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Contact Person</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                  <textarea 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm min-h-[80px]"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Notes (Optional)</label>
                  <textarea 
                    className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm min-h-[100px]"
                    placeholder="Add any additional information about this supplier..."
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={resetSupplierForm}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
