import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';
import { supabaseService } from '../services/supabaseService';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    activeTokens: 0,
    totalPatients: 0,
    totalOrders: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [sales, tokens, meds, orders] = await Promise.all([
          supabaseService.getSales(),
          supabaseService.getTokens(),
          supabaseService.getMedications(),
          supabaseService.getPurchaseOrders()
        ]);

        const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const activeTokens = tokens.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;
        const totalOrders = orders.length;
        
        // Mocking total patients for now as we don't have a patients table yet
        const totalPatients = 1240; 

        setStats({
          totalSales,
          activeTokens,
          totalPatients,
          totalOrders
        });

        // Process chart data (last 7 days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            name: days[date.getDay()],
            date: date.toISOString().split('T')[0],
            sales: 0,
            tokens: 0
          };
        });

        sales.forEach(sale => {
          const saleDate = sale.timestamp.split('T')[0];
          const day = last7Days.find(d => d.date === saleDate);
          if (day) day.sales += sale.totalAmount;
        });

        tokens.forEach(token => {
          const tokenDate = token.timestamp.split('T')[0];
          const day = last7Days.find(d => d.date === tokenDate);
          if (day) day.tokens += 1;
        });

        setChartData(last7Days);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Sales" 
          value={`${stats.totalSales.toLocaleString()}`} 
          change="+12.5%" 
          trend="up"
          icon={TrendingUp} 
          color="blue" 
        />
        <StatCard 
          label="Active Tokens" 
          value={stats.activeTokens.toString()} 
          change="-4.2%" 
          trend="down"
          icon={Clock} 
          color="amber" 
        />
        <StatCard 
          label="Total Patients" 
          value={stats.totalPatients.toLocaleString()} 
          change="+8.1%" 
          trend="up"
          icon={Users} 
          color="emerald" 
        />
        <StatCard 
          label="Orders" 
          value={stats.totalOrders.toString()} 
          change="+14.3%" 
          trend="up"
          icon={ShoppingBag} 
          color="purple" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Token Traffic</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="tokens" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, trend, icon: Icon, color }: { label: string, value: string, change: string, trend: 'up' | 'down', icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
