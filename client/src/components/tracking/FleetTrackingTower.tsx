import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Navigation, 
  MapPin, 
  Gauge, 
  Thermometer, 
  Fuel, 
  Clock, 
  CheckCircle2, 
  Radio, 
  PlusCircle, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Shipment } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { mockEngine } from '../../api/mockEngine.ts';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const FleetTrackingTower: React.FC = () => {
  const { 
    selectedShipmentTracking, 
    setSelectedShipmentTracking, 
    setIsCreateShipmentModalOpen 
  } = useSupplyChainStore();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);

  const loadShipments = async () => {
    const data = await api.getShipments();
    setShipments(data);
    if (selectedShipmentTracking) {
      const found = data.find(s => s.trackingNumber === selectedShipmentTracking);
      if (found) setSelectedShipment(found);
      else if (data.length > 0) setSelectedShipment(data[0]);
    } else if (data.length > 0) {
      setSelectedShipment(data[0]);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [selectedShipmentTracking]);

  const handleSimulateGpsPing = () => {
    if (!selectedShipment) return;
    setIsSimulatingPing(true);

    // Advance progress by 5% and publish telemetry outbox event
    const newProgress = Math.min(99, selectedShipment.progressPercent + 5);
    const updated = { ...selectedShipment, progressPercent: newProgress };
    setSelectedShipment(updated);

    mockEngine.publishOutboxEvent(
      'Shipment',
      selectedShipment.trackingNumber,
      'TELEMETRY_INGESTED',
      'logistics.telemetry.gps',
      JSON.stringify({
        trackingNumber: selectedShipment.trackingNumber,
        latitude: selectedShipment.currentLatitude + 0.05,
        longitude: selectedShipment.currentLongitude + 0.05,
        speedKmh: 84.5,
        fuelPercent: 74.0,
        cargoTemperatureC: 19.1,
        recordedAt: new Date().toISOString()
      }, null, 2)
    );

    setTimeout(() => {
      setIsSimulatingPing(false);
      loadShipments();
    }, 800);
  };

  const filteredShipments = shipments.filter(s => {
    if (filterMode === 'IN_TRANSIT') return s.status === 'IN_TRANSIT';
    if (filterMode === 'DELIVERED') return s.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 font-mono-code mb-1">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>GLOBAL FLEET CONTROL TOWER</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Modal Cargo Transit & Fleet Positioning
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
            Active satellite tracking, telematics diagnostics and corridor progress
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadShipments}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCreateShipmentModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Dispatch New Cargo</span>
          </button>
        </div>
      </div>

      {/* Main Control Tower Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Shipment Fleet Selector */}
        <div className="clean-card bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Active Shipments ({shipments.length})</h3>
            <div className="flex items-center gap-1 text-[11px]">
              {['ALL', 'IN_TRANSIT', 'DELIVERED'].map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    filterMode === m ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {m === 'ALL' ? 'All' : m === 'IN_TRANSIT' ? 'In Transit' : 'Delivered'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredShipments.map((s) => {
              const isSelected = selectedShipment?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedShipment(s);
                    setSelectedShipmentTracking(s.trackingNumber);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-2xs ring-1 ring-blue-500/20'
                      : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code font-bold text-xs text-slate-900">{s.trackingNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      s.status === 'DELIVERED' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium mt-1.5 flex items-center gap-1.5">
                    <span>{s.originWarehouseCode}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-900">{s.destinationCity} ({s.destinationCountry})</span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{s.carrier}</span>
                      <span className="font-mono-code font-bold text-slate-700">{s.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${s.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Shipment Corridor Map & Telemetry Dashboard */}
        {selectedShipment ? (
          <div className="lg:col-span-2 space-y-5">
            {/* Live Telematics HUD Bar */}
            <div className="clean-card bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold font-mono-code text-white">
                        {selectedShipment.trackingNumber}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30">
                        {selectedShipment.transportMode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Carrier: <strong className="text-slate-200">{selectedShipment.carrier}</strong> • Route: {selectedShipment.originWarehouseName} → {selectedShipment.destinationCity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateGpsPing}
                  disabled={isSimulatingPing || selectedShipment.status === 'DELIVERED'}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isSimulatingPing ? 'animate-spin' : ''}`} />
                  <span>{isSimulatingPing ? 'Ingesting Ping...' : 'Simulate GPS Ping'}</span>
                </button>
              </div>

              {/* Sensor Diagnostics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ground Speed</span>
                  </div>
                  <p className="text-lg font-mono-code font-extrabold text-white">
                    {selectedShipment.status === 'DELIVERED' ? '0 km/h' : '84.2 km/h'}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Within safety limit</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cold Chain Temp</span>
                  </div>
                  <p className="text-lg font-mono-code font-extrabold text-white">19.2°C</p>
                  <span className="text-[10px] text-emerald-400 font-medium">Optimal Cargo Range</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fuel Reserve</span>
                  </div>
                  <p className="text-lg font-mono-code font-extrabold text-white">76%</p>
                  <span className="text-[10px] text-slate-400 font-medium">Range: ~480 km</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Est. Arrival</span>
                  </div>
                  <p className="text-lg font-mono-code font-extrabold text-white">18:40 CEST</p>
                  <span className="text-[10px] text-purple-400 font-medium">On-Time Expected</span>
                </div>
              </div>

              {/* Real-time GPS coordinate footer */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 font-mono-code">
                <span>Coordinates: {selectedShipment.currentLatitude.toFixed(4)}° N, {selectedShipment.currentLongitude.toFixed(4)}° E</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  AMQP Outbox Poller Connected
                </span>
              </div>
            </div>

            {/* Timeline Milestones Card */}
            <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Transit Milestones & Chain of Custody
              </h3>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                <div className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">Order Picked & Verified at Distribution Hub</p>
                    <p className="text-slate-500 font-mono-code">{selectedShipment.originWarehouseName} ({selectedShipment.originWarehouseCode})</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">Freight Loaded & Dispatched onto Transit Corridor</p>
                    <p className="text-slate-500 font-mono-code">{selectedShipment.carrier} • Mode: {selectedShipment.transportMode}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    selectedShipment.progressPercent >= 50
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700 animate-pulse'
                  }`}>
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">Corridor Checkpoint & Customs Clearance</p>
                    <p className="text-slate-500 font-mono-code">Electronic Waybill #CMR-89241 Validated</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 relative">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    selectedShipment.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">Final Destination Arrival</p>
                    <p className="text-slate-500 font-mono-code">{selectedShipment.destinationCity}, {selectedShipment.destinationCountry}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 clean-card p-12 text-center text-slate-400">
            Select a shipment from the fleet list to view telemetry.
          </div>
        )}
      </div>
    </div>
  );
};
