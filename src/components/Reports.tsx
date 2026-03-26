import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity
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
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { cn } from '../lib/utils';

const SALES_DATA = [
  { name: 'Jan', sales: 45000, profit: 12000 },
  { name: 'Feb', sales: 52000, profit: 15000 },
  { name: 'Mar', sales: 48000, profit: 13500 },
  { name: 'Apr', sales: 61000, profit: 18000 },
  { name: 'May', sales: 55000, profit: 16500 },
  { name: 'Jun', sales: 67000, profit: 21000 },
];

const CATEGORY_DATA = [
  { name: 'Antibiotics', value: 400, color: '#3b82f6' },
  { name: 'Pain Relief', value: 300, color: '#10b981' },
  { name: 'Hypertension', value: 300, color: '#f59e0b' },
  { name: 'Diabetes', value: 200, color: '#ef4444' },
  { name: 'Vitamins', value: 150, color: '#8b5cf6' },
];

const TOP_PRODUCTS = [
  { name: 'Amoxicillin 500mg', sales: 1240, growth: '+12%', trend: 'up' },
  { name: 'Ibuprofen 400mg', sales: 980, growth: '+8%', trend: 'up' },
  { name: 'Lisinopril 10mg', sales: 850, growth: '-3%', trend: 'down' },
  { name: 'Metformin 500mg', sales: 720, growth: '+15%', trend: 'up' },
  { name: 'Atorvastatin 20mg', sales: 640, growth: '+5%', trend: 'up' },
];

export default function Reports() {
  const [timeRange, setTimeRange] = useState('6M');

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500 mt-1">Detailed insights into your pharmacy performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Customize Report
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStat 
          label="Total Revenue" 
          value="$328,400" 
          change="+15.4%" 
          trend="up" 
          icon={DollarSign} 
          color="blue" 
        />
        <ReportStat 
          label="Gross Profit" 
          value="$96,000" 
          change="+12.2%" 
          trend="up" 
          icon={TrendingUp} 
          color="emerald" 
        />
        <ReportStat 
          label="Total Orders" 
          value="4,820" 
          change="+8.1%" 
          trend="up" 
          icon={ShoppingBag} 
          color="amber" 
        />
        <ReportStat 
          label="Average Sale" 
          value="$68.13" 
          change="-2.4%" 
          trend="down" 
          icon={Activity} 
          color="purple" 
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Revenue vs Profit</h3>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
              {['1M', '3M', '6M', '1Y'].map(range => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                    timeRange === range ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="sales" name="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Sales by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  product.trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {product.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {product.growth}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Inventory Health</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Stock Level" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, change, trend, icon: Icon, color }: { label: string, value: string, change: string, trend: 'up' | 'down', icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
