import { useState, useMemo } from 'react';
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
  PackageX
} from 'lucide-react';
import { format, isPast, isBefore, addMonths } from 'date-fns';
import { cn } from '../lib/utils';
import { Medication } from '../types';

// Mock data for now
const MOCK_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 15, reorderThreshold: 20, expirationDate: '2026-05-15', price: 12.50, unit: 'Capsules', lastUpdated: '2026-03-25' },
  { id: '2', name: 'Lisinopril 10mg', category: 'Hypertension', stock: 120, reorderThreshold: 50, expirationDate: '2027-01-10', price: 8.00, unit: 'Tablets', lastUpdated: '2026-03-24' },
  { id: '3', name: 'Atorvastatin 20mg', category: 'Cholesterol', stock: 8, reorderThreshold: 30, expirationDate: '2026-04-01', price: 15.20, unit: 'Tablets', lastUpdated: '2026-03-26' },
  { id: '4', name: 'Metformin 500mg', category: 'Diabetes', stock: 250, reorderThreshold: 100, expirationDate: '2026-12-20', price: 5.50, unit: 'Tablets', lastUpdated: '2026-03-20' },
  { id: '5', name: 'Ibuprofen 400mg', category: 'Pain Relief', stock: 45, reorderThreshold: 50, expirationDate: '2026-03-30', price: 6.75, unit: 'Tablets', lastUpdated: '2026-03-22' },
];

export default function Inventory() {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const filteredMedications = useMemo(() => {
    return medications.filter(med => 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [medications, searchQuery]);

  const stats = useMemo(() => {
    const total = medications.length;
    const lowStock = medications.filter(m => m.stock <= m.reorderThreshold).length;
    const expiringSoon = medications.filter(m => {
      const expDate = new Date(m.expirationDate);
      return isBefore(expDate, addMonths(new Date(), 3)) && !isPast(expDate);
    }).length;
    const expired = medications.filter(m => isPast(new Date(m.expirationDate))).length;

    return { total, lowStock, expiringSoon, expired };
  }, [medications]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this medication?')) {
      setMedications(meds => meds.filter(m => m.id !== id));
    }
  };

  const getStockStatus = (med: Medication) => {
    if (med.stock === 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-50' };
    if (med.stock <= med.reorderThreshold) return { label: 'Low Stock', color: 'text-amber-500 bg-amber-50' };
    return { label: 'In Stock', color: 'text-emerald-500 bg-emerald-50' };
  };

  const getExpirationStatus = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date)) return { label: 'Expired', color: 'text-red-500' };
    if (isBefore(date, addMonths(new Date(), 3))) return { label: 'Expiring Soon', color: 'text-amber-500' };
    return { label: format(date, 'MMM dd, yyyy'), color: 'text-gray-600' };
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Manage your pharmacy stock and reorder alerts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Medications" 
          value={stats.total} 
          icon={PackageCheck} 
          color="blue" 
        />
        <StatCard 
          label="Low Stock Alerts" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          color="amber" 
          alert={stats.lowStock > 0}
        />
        <StatCard 
          label="Expiring Soon" 
          value={stats.expiringSoon} 
          icon={Calendar} 
          color="orange" 
          alert={stats.expiringSoon > 0}
        />
        <StatCard 
          label="Expired Items" 
          value={stats.expired} 
          icon={PackageX} 
          color="red" 
          alert={stats.expired > 0}
        />
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
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                const status = getStockStatus(med);
                const expStatus = getExpirationStatus(med.expirationDate);
                return (
                  <tr key={med.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{med.name}</div>
                      <div className="text-xs text-gray-500">{med.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{med.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-semibold",
                          med.stock <= med.reorderThreshold ? "text-amber-600" : "text-gray-900"
                        )}>
                          {med.stock}
                        </span>
                        <span className="text-xs text-gray-400">/ {med.reorderThreshold} min</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            med.stock === 0 ? "bg-red-500" : 
                            med.stock <= med.reorderThreshold ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${Math.min((med.stock / (med.reorderThreshold * 2)) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-sm font-medium", expStatus.color)}>
                        {expStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${med.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", status.color)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingMedication(med)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(med.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal (Simplified for now) */}
      {(showAddModal || editingMedication) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h3>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newMed: Medication = {
                id: editingMedication?.id || Math.random().toString(36).substr(2, 9),
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                stock: Number(formData.get('stock')),
                reorderThreshold: Number(formData.get('threshold')),
                expirationDate: formData.get('expirationDate') as string,
                price: Number(formData.get('price')),
                unit: formData.get('unit') as string,
                lastUpdated: new Date().toISOString().split('T')[0],
              };

              if (editingMedication) {
                setMedications(meds => meds.map(m => m.id === editingMedication.id ? newMed : m));
              } else {
                setMedications(meds => [newMed, ...meds]);
              }
              
              setShowAddModal(false);
              setEditingMedication(null);
            }}>
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
                  <label className="text-xs font-semibold text-gray-500 uppercase">Stock</label>
                  <input name="stock" type="number" defaultValue={editingMedication?.stock} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Threshold</label>
                  <input name="threshold" type="number" defaultValue={editingMedication?.reorderThreshold} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" required />
                </div>
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
                <label className="text-xs font-semibold text-gray-500 uppercase">Expiration Date</label>
                <input name="expirationDate" type="date" defaultValue={editingMedication?.expirationDate} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" required />
              </div>
              <div className="flex gap-3 pt-4">

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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, alert }: { label: string, value: number, icon: any, color: string, alert?: boolean }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl shadow-sm border transition-all",
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
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
