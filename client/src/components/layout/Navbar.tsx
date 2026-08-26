import React from 'react';
import { 
  Boxes, 
  Radio, 
  Search, 
  Building2, 
  Bell, 
  Settings, 
  ChevronDown
} from 'lucide-react';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const Navbar: React.FC = () => {
  const { 
    selectedWarehouseCode, 
    setSelectedWarehouseCode, 
    searchQuery, 
    setSearchQuery,
    notificationCount,
    clearNotifications,
    setActiveTab
  } = useSupplyChainStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-6">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">LogiSync</span>
              <span className="text-blue-600 font-semibold text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase tracking-wider">Core</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Global Supply Chain Intelligence</p>
          </div>
        </div>

        {/* Real-Time Event-Driven Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          <span>Event-Driven Outbox • RabbitMQ Active</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU / Tracking / Order..."
            className="w-full pl-10 pr-12 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono-code font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right Controls: Warehouse Selector, User Profile & Actions */}
      <div className="flex items-center gap-3">
        {/* Warehouse Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedWarehouseCode}
            onChange={(e) => setSelectedWarehouseCode(e.target.value)}
            className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold pl-8 pr-8 py-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition-colors"
          >
            <option value="ALL">All Hubs (Global Network)</option>
            <option value="W-ROT-01">Rotterdam Central</option>
            <option value="W-BCN-02">Barcelona Hub</option>
            <option value="W-FRA-03">Frankfurt Terminal</option>
          </select>
          <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
            AR
          </div>
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-none">Operations Manager</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
            </span>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={clearNotifications}
          title="Notifications & Alerts"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setActiveTab('outbox')}
          title="System Health & Observability"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
