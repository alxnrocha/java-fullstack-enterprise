import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { QuickActionModals } from './components/layout/QuickActionModals.tsx';
import { useSupplyChainStore } from './stores/useSupplyChainStore.ts';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard.tsx';
import { InventoryMatrix } from './components/inventory/InventoryMatrix.tsx';
import { PickingTerminal } from './components/picking/PickingTerminal.tsx';
import { FleetTrackingTower } from './components/tracking/FleetTrackingTower.tsx';
import { OutboxInspector } from './components/observability/OutboxInspector.tsx';

export default function App() {
  const { activeTab } = useSupplyChainStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-blue-500/20 selection:text-blue-700">
      {/* Top Institutional Navbar */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic Main Content Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {activeTab === 'home' && <ExecutiveDashboard />}
          {activeTab === 'inventory' && <InventoryMatrix />}
          {activeTab === 'picking' && <PickingTerminal />}
          {(activeTab === 'shipments' || activeTab === 'tracking') && <FleetTrackingTower />}
          {activeTab === 'outbox' && <OutboxInspector />}
          {activeTab === 'warehouses' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">European Distribution Hubs</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">Automated Pallet Storage & Cross-Docking Capacity</p>
              </div>
              <ExecutiveDashboard />
            </div>
          )}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <QuickActionModals />
    </div>
  );
}
