import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Building2, 
  AlertTriangle, 
  Plus, 
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { InventoryItem } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { InventoryTable } from './InventoryTable.tsx';
import { SkuDrawer } from './SkuDrawer.tsx';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const InventoryMatrix: React.FC = () => {
  const { 
    selectedWarehouseCode, 
    setSelectedWarehouseCode, 
    searchQuery, 
    setSearchQuery,
    setIsStockTransferModalOpen 
  } = useSupplyChainStore();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await api.getInventory(selectedWarehouseCode);
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [selectedWarehouseCode]);

  // Filter items in-memory based on category, status, and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesName = item.productName.toLowerCase().includes(q);
        const matchesBarcode = item.barcode.toLowerCase().includes(q);
        if (!matchesSku && !matchesName && !matchesBarcode) return false;
      }
      // Reorder Status
      if (selectedStatus !== 'ALL' && item.reorderStatus !== selectedStatus) {
        return false;
      }
      // Category
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedStatus, selectedCategory]);

  // Aggregate stats
  const totalValuation = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantityOnHand * curr.unitCost, 0);
  }, [items]);

  const lowStockCount = useMemo(() => {
    return items.filter(i => i.reorderStatus === 'LOW' || i.reorderStatus === 'CRITICAL').length;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Warehouse Inventory Matrix
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
            Real-time stock availability, bin locations and reorder points across European distribution centers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadInventory}
            title="Refresh Inventory"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsStockTransferModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stock Transfer</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Total SKUs</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono-code mt-1">{items.length}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Active Hubs</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono-code mt-1">3 Distribution Hubs</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Valuation</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 font-mono-code mt-1">
            ${(totalValuation / 1000).toFixed(1)}k
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600 font-mono-code mt-1">
            {lowStockCount} Low / Critical
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by SKU / Name / Barcode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse Dropdown */}
          <select
            value={selectedWarehouseCode}
            onChange={(e) => setSelectedWarehouseCode(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="ALL">All Hubs</option>
            <option value="W-ROT-01">Rotterdam Central</option>
            <option value="W-BCN-02">Barcelona Hub</option>
            <option value="W-FRA-03">Frankfurt Terminal</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="ALL">All Reorder Status</option>
            <option value="OK">In Stock (OK)</option>
            <option value="LOW">Low Stock</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="APPAREL">Apparel</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="HYDRAULICS">Hydraulics</option>
            <option value="LUGGAGE">Luggage</option>
          </select>
        </div>
      </div>

      {/* TanStack Table Matrix */}
      <InventoryTable 
        data={filteredItems} 
        onSelectItem={(item) => setActiveItem(item)} 
      />

      {/* SKU Specification & Allocation Drawer */}
      <SkuDrawer
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onAllocated={() => {
          setActiveItem(null);
          loadInventory();
        }}
      />
    </div>
  );
};
