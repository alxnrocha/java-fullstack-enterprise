import React, { useEffect, useState } from 'react';
import { 
  Barcode, 
  CheckCircle2, 
  Send, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PickingBatch } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const PickingTerminal: React.FC = () => {
  const { setActiveTab } = useSupplyChainStore();
  const [batch, setBatch] = useState<PickingBatch | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatchedSuccess, setIsDispatchedSuccess] = useState(false);

  const loadBatch = async () => {
    const data = await api.getPickingBatch();
    setBatch(data);
  };

  useEffect(() => {
    loadBatch();
  }, []);

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const result = await api.scanItem(barcodeInput.trim());
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setBatch(result.batch);
      setBarcodeInput('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleQuickScanItem = async (barcode: string) => {
    setBarcodeInput(barcode);
    const result = await api.scanItem(barcode);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setBatch(result.batch);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleCompleteDispatch = async () => {
    try {
      setIsDispatching(true);
      const updated = await api.completeAndDispatchPickingBatch();
      setBatch(updated);
      setIsDispatchedSuccess(true);
      setTimeout(() => {
        setIsDispatchedSuccess(false);
      }, 3000);
    } finally {
      setIsDispatching(false);
    }
  };

  if (!batch) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        Loading picking terminal checklist...
      </div>
    );
  }

  const allScanned = batch.items.every(i => i.isScanned);

  return (
    <div className="space-y-6">
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 font-mono-code mb-1">
            <Barcode className="w-4 h-4" />
            <span>WAREHOUSE FULFILLMENT TERMINAL</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Picking Batch #{batch.batchCode}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
              batch.status === 'DISPATCHED' 
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : batch.status === 'PACKED'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {batch.status}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Customer: <strong className="text-slate-700">{batch.customerName}</strong> • Distribution Hub: <strong className="text-slate-700">{batch.warehouseName} ({batch.warehouseCode})</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBatch}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            disabled={!allScanned || batch.status === 'DISPATCHED' || isDispatching}
            onClick={handleCompleteDispatch}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>{batch.status === 'DISPATCHED' ? 'Batch Dispatched' : 'Complete & Authorize Dispatch'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Specifications Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Picking Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900 font-mono-code">
              {batch.progressPercent}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono-code">
              {batch.pickedItems} / {batch.items.length} items
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${batch.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority Level</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase font-mono-code">
              {batch.priority} PRIORITY
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Same-day European freight commitment</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Net Weight</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono-code mt-1">
            {batch.totalWeightKg} <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Volume: {batch.totalVolumeM3} m³</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Outbox Synchronization</span>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Postgres + RabbitMQ</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Order confirmation stream active</p>
        </div>
      </div>

      {/* Barcode Scanner Emulator */}
      <div className="clean-card bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono-code">
                Industrial Barcode Scanner Emulator
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Scan barcode via handheld laser scanner or click "Quick Scan" on any pending line item below.
            </p>
          </div>

          <form onSubmit={handleScanSubmit} className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter or scan EAN-13 barcode (e.g. 735008239006)..."
              className="flex-1 px-3.5 py-2 text-xs font-mono-code bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
            >
              Verify Barcode
            </button>
          </form>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' 
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Dispatched Confirmation Banner */}
      {isDispatchedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-sm font-bold">Batch #{batch.batchCode} Dispatched Successfully!</h4>
              <p className="text-xs text-emerald-700">
                Transactional Outbox event <span className="font-mono-code font-bold text-blue-600">ORDER_CONFIRMED</span> published to RabbitMQ queue.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('outbox')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Inspect in Outbox
          </button>
        </div>
      )}

      {/* Line Items Checklist */}
      <div className="clean-card bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Checklist de Separação & Bin Allocation</h3>
            <p className="text-[11px] text-slate-500">Pick route optimized by Aisle / Rack / Shelf sequence</p>
          </div>
          <span className="text-xs font-mono-code font-bold text-slate-600">
            {batch.items.filter(i => i.isScanned).length} of {batch.items.length} Completed
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {batch.items.map((item, idx) => (
            <div 
              key={item.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                item.isScanned ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono-code font-bold text-xs shrink-0 ${
                  item.isScanned 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.isScanned ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : idx + 1}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-sm text-slate-900">{item.sku}</span>
                    <span className="text-[11px] font-mono-code text-slate-400">Barcode: {item.barcode}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{item.productName}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono-code text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      📍 Bin: {item.locationFormatted}
                    </span>
                    <span>•</span>
                    <span className="font-mono-code">Lot: {item.batchNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quantity</span>
                  <div className="text-sm font-mono-code font-extrabold text-slate-800">
                    {item.pickedQuantity} / {item.requiredQuantity} <span className="text-xs font-normal text-slate-500">pcs</span>
                  </div>
                </div>

                {item.isScanned ? (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleQuickScanItem(item.barcode)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Quick Scan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
