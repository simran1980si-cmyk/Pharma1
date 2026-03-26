import { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  XCircle,
  MoreVertical,
  User,
  Hash,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Token } from '../types';
import { supabaseService } from '../services/supabaseService';

export default function TokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const data = await supabaseService.getTokens();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  const filteredTokens = useMemo(() => {
    return tokens.filter(token => 
      token.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  const stats = useMemo(() => {
    const pending = tokens.filter(t => t.status === 'PENDING').length;
    const processing = tokens.filter(t => t.status === 'PROCESSING').length;
    const completed = tokens.filter(t => t.status === 'COMPLETED').length;
    return { pending, processing, completed };
  }, [tokens]);

  const updateStatus = async (id: string, status: Token['status']) => {
    try {
      await supabaseService.updateTokenStatus(id, status);
      setTokens(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (error) {
      console.error('Error updating token status:', error);
    }
  };

  const getStatusConfig = (status: Token['status']) => {
    switch (status) {
      case 'PENDING': return { label: 'Pending', color: 'text-amber-600 bg-amber-50', icon: Clock };
      case 'PROCESSING': return { label: 'Processing', color: 'text-blue-600 bg-blue-50', icon: Loader2 };
      case 'COMPLETED': return { label: 'Completed', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle };
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Token Management</h2>
          <p className="text-gray-500 mt-1">Monitor and manage patient queue tokens.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Issue New Token
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Tokens" value={stats.pending} color="amber" icon={Clock} />
        <StatCard label="Currently Processing" value={stats.processing} color="blue" icon={Loader2} />
        <StatCard label="Completed Today" value={stats.completed} color="emerald" icon={CheckCircle2} />
      </div>

      {/* Token List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by patient or token #..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
            <Filter className="w-4 h-4" />
            Filter Status
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading tokens...</p>
            </div>
          ) : (
            filteredTokens.map((token) => {
              const config = getStatusConfig(token.status);
              return (
                <div key={token.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5", config.color)}>
                      <config.icon className={cn("w-3 h-3", token.status === 'PROCESSING' && "animate-spin")} />
                      {config.label}
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{token.patientName}</h4>
                        <p className="text-xs text-gray-500">Patient Name</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-600 leading-tight">{token.tokenNumber}</h4>
                        <p className="text-xs text-gray-500">Token Number</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                    {token.status === 'PENDING' && (
                      <button 
                        onClick={() => updateStatus(token.id, 'PROCESSING')}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Process
                      </button>
                    )}
                    {token.status === 'PROCESSING' && (
                      <button 
                        onClick={() => updateStatus(token.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {(token.status === 'PENDING' || token.status === 'PROCESSING') && (
                      <button 
                        onClick={() => updateStatus(token.id, 'CANCELLED')}
                        className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {token.status === 'COMPLETED' && (
                      <div className="flex-1 py-2 text-center text-emerald-600 text-xs font-bold">
                        Order Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Issue New Token</h3>
            </div>
            <form className="p-6 space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const formData = new FormData(e.currentTarget);
                const tokenData = {
                  patientName: formData.get('patientName') as string,
                  tokenNumber: `T-${(tokens.length + 1).toString().padStart(3, '0')}`,
                  status: 'PENDING' as const,
                  timestamp: new Date().toISOString(),
                };
                await supabaseService.addToken(tokenData);
                const updatedTokens = await supabaseService.getTokens();
                setTokens(updatedTokens);
                setShowAddModal(false);
              } catch (error) {
                console.error('Error issuing token:', error);
              }
            }}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Patient Name</label>
                <input name="patientName" type="text" className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm" placeholder="Enter patient's full name" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}
