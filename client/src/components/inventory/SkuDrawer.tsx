import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Layers, 
  Send, 
  CheckCircle2, 
  Barcode, 
  AlertCircle 
} from 'lucide-react';
import { InventoryItem } from '../../types/index.ts';
import { api } from '../../api/client.ts';

interface SkuDrawerProps {
  item: InventoryItem | null;
  onClose: () => void;
  onAllocated: () => void;
}

export const SkuDrawer: React.FC<SkuDrawerProps> = ({ item, onClose, onAllocated }) => {
  const [allocateQty, setAllocateQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await api.allocateStock(item.id, allocateQty);
      setSuccessMsg(`Allocated ${allocateQty} units of ${item.sku}. Outbox event published to RabbitMQ!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onAllocated();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Allocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 font-mono-code">
              <Package className="w-4 h-4" />
              <span>SKU SPECIFICATION</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 mt-2 font-mono-code tracking-tight">
            {item.sku}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {item.productName}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
              {item.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              item.reorderStatus === 'CRITICAL'
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : item.reorderStatus === 'LOW'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              Stock: {item.reorderStatus}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Stock Counts Matrix */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">On Hand</span>
              <p className="text-lg font-extrabold text-slate-900 font-mono-code mt-0.5">
                {item.quantityOnHand}
              </p>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Reserved</span>
              <p className="text-lg font-extrabold text-amber-600 font-mono-code mt-0.5">
                {item.quantityReserved}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Available</span>
              <p className="text-lg font-extrabold text-emerald-600 font-mono-code mt-0.5">
                {item.quantityAvailable}
              </p>
            </div>
          </div>

          {/* Barcode & Hub Coordinates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Location & Tracking</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> Warehouse Hub
                </span>
                <span className="font-bold text-slate-800">{item.warehouseName} ({item.warehouseCode})</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> Bin Coordinate
                </span>
                <span className="font-mono-code font-bold text-blue-600">{item.locationFormatted}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Barcode className="w-3.5 h-3.5 text-slate-600" /> Barcode EAN-13
                </span>
                <span className="font-mono-code font-bold text-slate-900">{item.barcode}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" /> Lot Batch
                </span>
                <span className="font-mono-code font-bold text-slate-700">{item.batchNumber}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Unit Cost
                </span>
                <span className="font-mono-code font-bold text-slate-900">${item.unitCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Atomic Stock Allocation Form */}
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-900">Transactional Stock Allocation</h4>
              <span className="text-[10px] font-mono-code font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded">
                RabbitMQ Outbox
              </span>
            </div>
            <p className="text-[11px] text-blue-700/80">
              Reserves stock quantity atomically in PostgreSQL and publishes event to AMQP queue.
            </p>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAllocate} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Reserve (Max Available: {item.quantityAvailable})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={item.quantityAvailable}
                    value={allocateQty}
                    onChange={(e) => setAllocateQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-1.5 text-xs font-mono-code font-bold bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || item.quantityAvailable <= 0}
                    className="flex-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publishing...' : 'Authorize Allocation'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>LogiSync Inventory Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
