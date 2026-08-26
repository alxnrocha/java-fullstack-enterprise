import React from 'react';
import { 
  Home, 
  Truck, 
  Package, 
  Building2, 
  CheckSquare, 
  Navigation, 
  Activity, 
  PlusCircle, 
  Barcode, 
  Search,
  CheckCircle,
  LucideIcon
} from 'lucide-react';
import { useSupplyChainStore, NavTab } from '../../stores/useSupplyChainStore.ts';

interface NavItem {
  id: NavTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'shipments', label: 'Shipments', icon: Truck, badge: '1,428' },
  { id: 'inventory', label: 'Inventory', icon: Package, badge: '3,842' },
  { id: 'warehouses', label: 'Warehouses', icon: Building2 },
  { id: 'picking', label: 'Picking & Packing', icon: CheckSquare, badge: 'Active' },
  { id: 'tracking', label: 'Tracking', icon: Navigation },
  { id: 'outbox', label: 'Observability & Outbox', icon: Activity, badge: 'Live' },
];

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsCreateShipmentModalOpen, 
    setIsPickingDrawerOpen 
  } = useSupplyChainStore();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] shrink-0">
      {/* Primary Navigation List */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            Operations Platform
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 font-bold' 
                        : 'bg-slate-100 text-slate-500 font-medium'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Access Actions */}
        <div>
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            Quick Actions
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setIsCreateShipmentModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
            >
              <PlusCircle className="w-4 h-4 text-blue-500" />
              <span>Create Shipment</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('picking');
                setIsPickingDrawerOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
            >
              <Barcode className="w-4 h-4 text-emerald-500" />
              <span>Barcode Picking Batch</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors text-left"
            >
              <Search className="w-4 h-4 text-amber-500" />
              <span>Stock Matrix Lookup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Infrastructure Status Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>System Status</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>All Systems Operational</span>
          </div>
          <div className="text-[10px] font-mono-code text-slate-400 pt-1 border-t border-slate-200 flex justify-between items-center">
            <span>Cluster v2.4.1</span>
            <span className="text-slate-500">RabbitMQ 3.13</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
