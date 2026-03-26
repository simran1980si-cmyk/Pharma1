import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit2, 
  Trash2, 
  Filter,
  Calendar,
  PackageCheck,
  PackageX,
  ChevronDown,
  ChevronUp,
  Layers,
  Loader2
} from 'lucide-react';
import { format, isPast, isBefore, addMonths, addDays } from 'date-fns';
import { cn } from '../lib/utils';
import { Medication } from '../types';
import { supabaseService } from '../services/supabaseService';

// Component
export default function Inventory() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'soonest' | 'furthest' | 'none'>('none');
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'expiring' | 'expiring-7d' | 'expired' | 'price-alerts'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [expandedMed, setExpandedMed] = useState<string | null>(null);
  const [modalBatches, setModalBatches] = useState<{ batchNumber: string, quantity: number, expirationDate: string }[]>([]);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const data = await supabaseService.getMedications();
        setMedications(data);
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, []);

  // When opening modal, initialize modalBatches
  const openAddModal = () => {
    setModalBatches([{ batchNumber: '', quantity: 0, expirationDate: '' }]);
    setShowAddModal(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMedication(med);
    setModalBatches(med.batches.length > 0 ? [...med.batches] : [{ batchNumber: '', quantity: 0, expirationDate: '' }]);
  };

  const addBatchToModal = () => {
    setModalBatches([...modalBatches, { batchNumber: '', quantity: 0, expirationDate: '' }]);
  };

  const updateModalBatch = (index: number, field: string, value: any) => {
    const newBatches = [...modalBatches];
    newBatches[index] = { ...newBatches[index], [field]: value };
    setModalBatches(newBatches);
  };

  const removeModalBatch = (index: number) => {
    if (modalBatches.length > 1) {
      setModalBatches(modalBatches.filter((_, i) => i !== index));
    }
  };

  const filteredMedications = useMemo(() => {
    let result = medications.filter(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterType === 'low-stock') {
      result = result.filter(m => {
        const usableStock = m.batches.reduce((sum, b) => isPast(new Date(b.expirationDate)) ? sum : sum + b.quantity, 0);
        return usableStock <= m.reorderThreshold;
      });
    } else if (filterType === 'expiring') {
      result = result.filter(m => {
        const expDate = new Date(m.expirationDate);
        return isBefore(expDate, addMonths(new Date(), 3)) && !isBefore(expDate, addDays(new Date(), 7)) && !isPast(expDate);
      });
    } else if (filterType === 'expiring-7d') {
      result = result.filter(m => {
        const expDate = new Date(m.expirationDate);
        return isBefore(expDate, addDays(new Date(), 7)) && !isPast(expDate);
      });
    } else if (filterType === 'expired') {
      result = result.filter(m => isPast(new Date(m.expirationDate)));
    } else if (filterType === 'price-alerts') {
      result = result.filter(m => {
        if (!m.previousPrice) return false;
        const threshold = m.priceAlertThreshold || 0.1;
        return Math.abs((m.price - m.previousPrice) / m.previousPrice) >= threshold;
      });
    }

    if (sortOrder === 'soonest') {
      result.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
    } else if (sortOrder === 'furthest') {
      result.sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime());
    }

    return result;
  }, [medications, searchQuery, sortOrder]);

  const stats = useMemo(() => {
    const total = medications.length;
    const lowStock = medications.filter(m => {
      const usableStock = m.batches.reduce((sum, b) => isPast(new Date(b.expirationDate)) ? sum : sum + b.quantity, 0);
      return usableStock <= m.reorderThreshold;
    }).length;
    const expiringSoon = medications.filter(m => {
      const expDate = new Date(m.expirationDate);
      return isBefore(expDate, addMonths(new Date(), 3)) && !isPast(expDate);
    }).length;
    const criticalExpiring = medications.filter(m => {
      const expDate = new Date(m.expirationDate);
      return isBefore(expDate, addDays(new Date(), 30)) && !isPast(expDate);
    }).length;
    const critical7d = medications.filter(m => {
      const expDate = new Date(m.expirationDate);
      return isBefore(expDate, addDays(new Date(), 7)) && !isPast(expDate);
    }).length;
    const expired = medications.filter(m => isPast(new Date(m.expirationDate))).length;
    const priceAlerts = medications.filter(m => {
      if (!m.previousPrice) return false;
      const threshold = m.priceAlertThreshold || 0.1;
      return Math.abs((m.price - m.previousPrice) / m.previousPrice) >= threshold;
    }).length;

    return { total, lowStock, expiringSoon, critical7d, expired, priceAlerts };
  }, [medications]);

  const handleDelete = async (id: string) => {
    try {
      await supabaseService.deleteMedication(id);
      setMedications(meds => meds.filter(m => m.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const getStockStatus = (med: Medication) => {
    if (med.stock === 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-50' };
    if (med.stock <= med.reorderThreshold) return { label: 'Low Stock', color: 'text-amber-500 bg-amber-50' };
    return { label: 'In Stock', color: 'text-emerald-500 bg-emerald-50' };
  };

  const getExpirationStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);
    const thirtyDaysFromNow = addDays(today, 30);
    const threeMonthsFromNow = addMonths(today, 3);

    if (isPast(date)) return { label: 'Expired', color: 'text-red-600 font-bold', isCritical: true, isUrgent: true };
    if (isBefore(date, sevenDaysFromNow)) return { label: 'CRITICAL: < 7d', color: 'text-red-700 font-black animate-pulse', isCritical: true, isUrgent: true };
    if (isBefore(date, thirtyDaysFromNow)) return { label: 'Expiring < 30d', color: 'text-red-500 font-bold', isCritical: true, isUrgent: false };
    if (isBefore(date, threeMonthsFromNow)) return { label: 'Expiring Soon', color: 'text-amber-500', isCritical: false, isUrgent: false };
    return { label: format(date, 'MMM dd, yyyy'), color: 'text-gray-600', isCritical: false, isUrgent: false };
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Manage your pharmacy stock and reorder alerts.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button 
          onClick={() => setFilterType('all')}
          className={cn(
            "text-left transition-all",
            filterType === 'all' ? "ring-2 ring-blue-500 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Total Medications" 
            value={stats.total} 
            icon={PackageCheck} 
            color="blue" 
          />
        </button>
        <button 
          onClick={() => setFilterType('low-stock')}
          className={cn(
            "text-left transition-all",
            filterType === 'low-stock' ? "ring-2 ring-amber-500 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Low Stock Alerts" 
            value={stats.lowStock} 
            icon={AlertTriangle} 
            color="amber" 
            alert={stats.lowStock > 0}
          />
        </button>
        <button 
          onClick={() => setFilterType('expiring-7d')}
          className={cn(
            "text-left transition-all",
            filterType === 'expiring-7d' ? "ring-2 ring-red-600 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Critical Expiry" 
            value={stats.critical7d} 
            icon={AlertTriangle} 
            color="red" 
            alert={stats.critical7d > 0}
            subValue="< 7 Days"
          />
        </button>
        <button 
          onClick={() => setFilterType('expiring')}
          className={cn(
            "text-left transition-all",
            filterType === 'expiring' ? "ring-2 ring-orange-500 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Expiring Soon" 
            value={stats.expiringSoon} 
            icon={Calendar} 
            color="orange" 
            alert={stats.criticalExpiring > 0}
            subValue={stats.criticalExpiring > 0 ? `${stats.criticalExpiring} < 30d` : undefined}
          />
        </button>
        <button 
          onClick={() => setFilterType('expired')}
          className={cn(
            "text-left transition-all",
            filterType === 'expired' ? "ring-2 ring-red-500 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Expired Items" 
            value={stats.expired} 
            icon={PackageX} 
            color="red" 
            alert={stats.expired > 0}
          />
        </button>
        <button 
          onClick={() => setFilterType('price-alerts')}
          className={cn(
            "text-left transition-all",
            filterType === 'price-alerts' ? "ring-2 ring-emerald-500 ring-offset-2 rounded-2xl" : ""
          )}
        >
          <StatCard 
            label="Price Alerts" 
            value={stats.priceAlerts} 
            icon={ArrowUpRight} 
            color="emerald" 
            alert={stats.priceAlerts > 0}
          />
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-transparent focus-within:border-blue-500/20 transition-all">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select 
                className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 cursor-pointer outline-none"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="none">No Expiration Sort</option>
                <option value="soonest">Soonest First</option>
                <option value="furthest">Furthest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading inventory...</p>
            </div>
          ) : (
            <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Medication Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Expiration</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedications.map((med) => {
                const usableStock = med.batches.reduce((sum, b) => isPast(new Date(b.expirationDate)) ? sum : sum + b.quantity, 0);
                const status = getStockStatus({ ...med, stock: usableStock });
                const expStatus = getExpirationStatus(med.expirationDate);
                const isExpanded = expandedMed === med.id;

                return (
                  <React.Fragment key={med.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setExpandedMed(isExpanded ? null : med.id)}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          <div>
                            <div className="font-medium text-gray-900">{med.name}</div>
                            <div className="text-xs text-gray-500">{med.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{med.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            usableStock <= med.reorderThreshold ? "text-amber-600" : "text-gray-900"
                          )}>
                            {usableStock}
                          </span>
                          <span className="text-xs text-gray-400">/ {med.reorderThreshold} min</span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              usableStock === 0 ? "bg-red-500" : 
                              usableStock <= med.reorderThreshold ? "bg-amber-500" : "bg-emerald-500"
                            )}
                            style={{ width: `${Math.min((usableStock / (med.reorderThreshold * 2)) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit transition-all",
                          expStatus.isUrgent ? "bg-red-100 ring-1 ring-red-200" : 
                          expStatus.isCritical ? "bg-red-50" : ""
                        )}>
                          {expStatus.isCritical && (
                            <AlertTriangle className={cn(
                              "w-3.5 h-3.5",
                              expStatus.isUrgent ? "text-red-700 animate-pulse" : "text-red-500"
                            )} />
                          )}
                          <span className={cn("text-sm font-medium", expStatus.color)}>
                            {expStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">${med.price.toFixed(2)}</span>
                          {med.previousPrice && Math.abs((med.price - med.previousPrice) / med.previousPrice) >= (med.priceAlertThreshold || 0.1) && (
                            <div className={cn(
                              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                              med.price > med.previousPrice ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
                            )} title={`Previous price: $${med.previousPrice.toFixed(2)}`}>
                              {med.price > med.previousPrice ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.round(Math.abs((med.price - med.previousPrice) / med.previousPrice) * 100)}%
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(med)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(med.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={7} className="px-12 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <Layers className="w-3 h-3" />
                              Batch Details
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              {med.batches.map((batch, bIdx) => {
                                const bExpStatus = getExpirationStatus(batch.expirationDate);
                                return (
                                  <div key={bIdx} className={cn(
                                    "bg-white p-3 rounded-xl border shadow-sm flex justify-between items-center transition-all",
                                    bExpStatus.isUrgent ? "border-red-200 bg-red-50 ring-1 ring-red-100" : 
                                    bExpStatus.isCritical ? "border-red-100 bg-red-50/30" : "border-gray-100"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      {bExpStatus.isCritical && (
                                        <AlertTriangle className={cn(
                                          "w-4 h-4",
                                          bExpStatus.isUrgent ? "text-red-600 animate-bounce" : "text-red-500"
                                        )} />
                                      )}
                                      <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Batch #{batch.batchNumber}</p>
                                        <p className="text-sm font-bold text-gray-900">{batch.quantity} {med.unit}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase">Expires</p>
                                      <p className={cn("text-xs font-medium", bExpStatus.color)}>{batch.expirationDate}</p>
                                    </div>
                                  </div>
                                );
                              })}
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
        )}
        </div>
      </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Delete Medication</h3>
                <p className="text-gray-500">Are you sure you want to delete this medication? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
      {(showAddModal || editingMedication) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h3>
            </div>
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const formData = new FormData(e.currentTarget);
                const batches = modalBatches.filter(b => b.batchNumber && b.quantity > 0);
                const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);
                const earliestExp = batches.length > 0 
                  ? batches.reduce((min, b) => b.expirationDate < min ? b.expirationDate : min, batches[0].expirationDate)
                  : '';

                const newPrice = Number(formData.get('price'));
                const medData: any = {
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  stock: totalStock,
                  reorderThreshold: Number(formData.get('threshold')),
                  expirationDate: earliestExp,
                  price: newPrice,
                  priceAlertThreshold: Number(formData.get('priceAlertThreshold')) / 100 || 0.1,
                  unit: formData.get('unit') as string,
                  lastUpdated: new Date().toISOString().split('T')[0],
                  batches: batches
                };

                if (editingMedication) {
                  await supabaseService.updateMedication(editingMedication.id, medData);
                } else {
                  await supabaseService.addMedication(medData);
                }
                const updatedMeds = await supabaseService.getMedications();
                setMedications(updatedMeds);
                setShowAddModal(false);
                setEditingMedication(null);
              } catch (error) {
                console.error('Error saving medication:', error);
              }
            }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                    <input name="name" type="text" defaultValue={editingMedication?.name} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="e.g. Amoxicillin" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                    <input name="category" type="text" defaultValue={editingMedication?.category} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="e.g. Antibiotics" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Price ($)</label>
                      <input name="price" type="number" step="0.01" defaultValue={editingMedication?.price} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Unit</label>
                      <input name="unit" type="text" defaultValue={editingMedication?.unit} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="e.g. Tablets" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Reorder Threshold</label>
                    <input name="threshold" type="number" defaultValue={editingMedication?.reorderThreshold} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Price Alert Threshold (%)</label>
                    <input name="priceAlertThreshold" type="number" defaultValue={editingMedication?.priceAlertThreshold ? editingMedication.priceAlertThreshold * 100 : 10} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="e.g. 10" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Batches</label>
                    <button 
                      type="button"
                      onClick={addBatchToModal}
                      className="text-[10px] font-bold text-blue-600 uppercase"
                    >
                      + Add Batch
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {modalBatches.map((batch, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-3 border border-gray-100 relative group/batch">
                        {modalBatches.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeModalBatch(i)}
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/batch:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Batch #</label>
                            <input 
                              name="batchNumber" 
                              type="text" 
                              value={batch.batchNumber} 
                              onChange={(e) => updateModalBatch(i, 'batchNumber', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                              required 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity</label>
                            <input 
                              name="batchQuantity" 
                              type="number" 
                              value={batch.quantity} 
                              onChange={(e) => updateModalBatch(i, 'quantity', Number(e.target.value))}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Expiration</label>
                          <input 
                            name="batchExpiration" 
                            type="date" 
                            value={batch.expirationDate} 
                            onChange={(e) => updateModalBatch(i, 'expirationDate', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs" 
                            required 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingMedication(null); }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  {editingMedication ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, alert, subValue }: { label: string, value: number, icon: any, color: string, alert?: boolean, subValue?: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl shadow-sm border transition-all h-full",
      alert ? "border-red-100 bg-red-50/30" : "border-gray-100"
    )}>
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {alert && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subValue && <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">{subValue}</span>}
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
