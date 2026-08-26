import React, { useState } from 'react';
import { X, Truck, Building2, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';
import { TransportMode } from '../../types/index.ts';

export const QuickActionModals: React.FC = () => {
  const { 
    isCreateShipmentModalOpen, 
    setIsCreateShipmentModalOpen 
  } = useSupplyChainStore();

  const [destinationCity, setDestinationCity] = useState('Madrid');
  const [destinationCountry, setDestinationCountry] = useState('Spain');
  const [carrier, setCarrier] = useState('DHL Freight Express');
  const [transportMode, setTransportMode] = useState<TransportMode>('ROAD_FREIGHT');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCreateShipmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsCreateShipmentModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create New Freight Shipment</h3>
              <p className="text-[11px] text-slate-500 font-medium">Triggers Event-Driven Transactional Outbox</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateShipmentModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Shipment Dispatched!</h4>
            <p className="text-xs text-slate-500">
              Event <span className="font-mono-code font-bold text-blue-600">SHIPMENT_DISPATCHED</span> published to RabbitMQ exchange.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Origin Warehouse</label>
              <div className="relative">
                <select className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                  <option value="W-ROT-01">Rotterdam Central Hub (Netherlands)</option>
                  <option value="W-BCN-02">Barcelona Hub (Spain)</option>
                  <option value="W-FRA-03">Frankfurt Terminal (Germany)</option>
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination City</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Country</label>
                <input
                  type="text"
                  required
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Logistics Carrier</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="DHL Freight Express">DHL Freight Express</option>
                <option value="Kuehne + Nagel">Kuehne + Nagel</option>
                <option value="Maersk Line Maritime">Maersk Line Maritime</option>
                <option value="DB Schenker Logistics">DB Schenker Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transport Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {(['ROAD_FREIGHT', 'MARITIME'] as TransportMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransportMode(mode)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      transportMode === mode
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {mode === 'ROAD_FREIGHT' ? '🚛 Road Freight' : '🚢 Maritime Cargo'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateShipmentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Authorize & Dispatch</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
