import { 
  LayoutDashboard, 
  Ticket, 
  Pill, 
  Warehouse, 
  Package, 
  FileText, 
  Activity 
} from 'lucide-react';
import { cn } from '../lib/utils';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tokens', label: 'Token Management', icon: Ticket },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 bg-[#1a232e] text-gray-300 h-screen flex flex-col border-r border-gray-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Renew Pharmacy</h1>
          <p className="text-gray-500 text-xs">Healthcare System</p>
        </div>
      </div>

      <div className="mt-8 px-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4 px-2">Navigation</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                activeTab === item.id 
                  ? "bg-[#2d3748] text-white" 
                  : "hover:bg-[#2d3748]/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-gray-500"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
