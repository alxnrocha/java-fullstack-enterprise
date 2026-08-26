import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Package, 
  Check, 
  MapPin 
} from 'lucide-react';
import { InventoryItem } from '../../types/index.ts';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';
import { api } from '../../api/client.ts';

interface StockAlertsCardProps {
  alerts: InventoryItem[];
  onReplenished?: () => void;
}

export const StockAlertsCard: React.FC<StockAlertsCardProps> = ({ alerts, onReplenished }) => {
  const { setActiveTab } = useSupplyChainStore();
  const [replenishingId, setReplenishingId] = useState<string | null>(null);

  const handleQuickAllocate = async (item: InventoryItem) => {
    try {
      setReplenishingId(item.id);
      await api.allocateStock(item.id, 1);
      setTimeout(() => {
        setReplenishingId(null);
        if (onReplenished) onReplenished();
      }, 800);
    } catch {
      setReplenishingId(null);
    }
  };

  return (
    <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Critical Stock Thresholds</h3>
              <p className="text-[11px] text-slate-500 font-medium">SKUs requiring replenishment or allocation</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-3 max-h-[300px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No critical stock alerts. All inventories optimal!
            </div>
          ) : (
            alerts.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-slate-900">{item.sku}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      item.reorderStatus === 'CRITICAL' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.reorderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate max-w-[220px]">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono-code">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.locationFormatted}
                    </span>
                    <span>•</span>
                    <span>Avail: <strong className="text-slate-700 font-mono-code">{item.quantityAvailable}</strong></span>
                  </div>
                </div>

                <button
                  disabled={replenishingId === item.id}
                  onClick={() => handleQuickAllocate(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    replenishingId === item.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200'
                  }`}
                >
                  {replenishingId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Allocated</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5" />
                      <span>Allocate</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
