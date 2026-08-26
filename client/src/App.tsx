import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { QuickActionModals } from './components/layout/QuickActionModals.tsx';
import { useSupplyChainStore } from './stores/useSupplyChainStore.ts';
import { 
  Truck, 
  Building2, 
  CheckSquare, 
  Navigation, 
  Activity 
} from 'lucide-react';

import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard.tsx';
import { InventoryMatrix } from './components/inventory/InventoryMatrix.tsx';

export default function App() {
  const { activeTab } = useSupplyChainStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-500/20 selection:text-blue-700">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic Main Content Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {activeTab === 'home' && <ExecutiveDashboard />}
          {activeTab === 'inventory' && <InventoryMatrix />}
          {activeTab !== 'home' && activeTab !== 'inventory' && (
            <div className="clean-card rounded-2xl p-6 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                {activeTab === 'shipments' && <Truck className="w-5 h-5" />}
                {activeTab === 'warehouses' && <Building2 className="w-5 h-5" />}
                {activeTab === 'picking' && <CheckSquare className="w-5 h-5" />}
                {activeTab === 'tracking' && <Navigation className="w-5 h-5" />}
                {activeTab === 'outbox' && <Activity className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 capitalize">
                  {activeTab === 'shipments' && 'Freight Logistics & Active Cargo Shipments'}
                  {activeTab === 'warehouses' && 'European Logistics Hubs & Pallet Capacity'}
                  {activeTab === 'picking' && 'Warehouse Picking, Packing & Barcode Checklist'}
                  {activeTab === 'tracking' && 'Live Cargo Telemetry & Route Map'}
                  {activeTab === 'outbox' && 'Transactional Outbox & RabbitMQ Observability'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  LogiSync Core v2.4.1 • Reactive Enterprise Supply Chain Platform
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>Active shell module loaded with responsive layout, search bar and warehouse selector.</p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 font-mono-code text-[11px] text-slate-700">
                <span>Active Route:</span>
                <span className="font-bold text-blue-600">/{activeTab}</span>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <QuickActionModals />
    </div>
  );
}
