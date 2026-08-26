import React, { useState } from 'react';
import { 
  Navigation, 
  Truck, 
  MapPin, 
  Radio, 
  Clock, 
  Gauge, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

interface MapHub {
  id: string;
  name: string;
  code: string;
  country: string;
  x: number;
  y: number;
  isMainHub: boolean;
  status: 'OPTIMAL' | 'HIGH_CAPACITY';
}

const HUBS: MapHub[] = [
  { id: 'h1', name: 'Rotterdam Central', code: 'W-ROT-01', country: 'NL', x: 370, y: 130, isMainHub: true, status: 'OPTIMAL' },
  { id: 'h2', name: 'Frankfurt Terminal', code: 'W-FRA-03', country: 'DE', x: 460, y: 180, isMainHub: true, status: 'HIGH_CAPACITY' },
  { id: 'h3', name: 'Barcelona Hub', code: 'W-BCN-02', country: 'ES', x: 280, y: 350, isMainHub: true, status: 'OPTIMAL' },
  { id: 'h4', name: 'Paris Gateway', code: 'GW-PAR-01', country: 'FR', x: 330, y: 200, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h5', name: 'Milan Transit', code: 'GW-MIL-02', country: 'IT', x: 440, y: 270, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h6', name: 'London Port Hub', code: 'GW-LON-03', country: 'UK', x: 260, y: 120, isMainHub: false, status: 'OPTIMAL' }
];

export const EuropeRouteMap: React.FC = () => {
  const { setSelectedShipmentTracking, setActiveTab } = useSupplyChainStore();
  const [activeHoverHub, setActiveHoverHub] = useState<MapHub | null>(null);

  return (
    <div className="clean-card bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white overflow-hidden shadow-lg relative">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 z-10 relative">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                European Logistics Corridors & Fleet Positioning
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  LIVE TELEMETRY
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Real-time GPS tracking via IoT telematics & AMQP message queues</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono-code">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Active Trucks:</span>
            <span className="font-bold text-emerald-400">82</span>
          </div>

          <button 
            onClick={() => setActiveTab('tracking')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            <span>Full Map View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas European Corridor Network */}
      <div className="relative w-full aspect-16/9 max-h-[380px] bg-radial from-slate-900 to-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
        {/* Background Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg viewBox="0 0 700 420" className="w-full h-full max-w-full">
          {/* Corridor Inter-city Curves */}
          {/* Rotterdam -> Paris */}
          <path d="M 370 130 Q 340 160 330 200" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
          {/* Paris -> Barcelona */}
          <path d="M 330 200 Q 300 270 280 350" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.8" />
          {/* Rotterdam -> Frankfurt */}
          <path d="M 370 130 Q 420 150 460 180" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="4 4" fill="none" opacity="0.9" />
          {/* Frankfurt -> Milan */}
          <path d="M 460 180 Q 450 230 440 270" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
          {/* London -> Rotterdam maritime link */}
          <path d="M 260 120 Q 310 120 370 130" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="6 3" fill="none" opacity="0.5" />

          {/* Active Live Truck TRK-45872 along Lyon/Rhone Corridor (Rotterdam -> Barcelona) */}
          <g 
            className="cursor-pointer group"
            onClick={() => {
              setSelectedShipmentTracking('TRK-45872');
              setActiveTab('tracking');
            }}
          >
            {/* Pulsing ring */}
            <circle cx="310" cy="275" r="14" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
            <circle cx="310" cy="275" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            {/* Truck Icon marker */}
            <text x="325" y="272" fill="#93c5fd" fontSize="11" fontWeight="bold" fontFamily="monospace">
              TRK-45872 (84 km/h)
            </text>
            <text x="325" y="286" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">
              DHL • Lyon Sector • 78%
            </text>
          </g>

          {/* Active Live Truck TRK-88491 (Frankfurt -> Rotterdam) */}
          <g 
            className="cursor-pointer group"
            onClick={() => {
              setSelectedShipmentTracking('TRK-88491');
              setActiveTab('tracking');
            }}
          >
            <circle cx="410" cy="155" r="12" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle cx="410" cy="155" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            <text x="425" y="152" fill="#6ee7b7" fontSize="11" fontWeight="bold" fontFamily="monospace">
              TRK-88491 (91 km/h)
            </text>
            <text x="425" y="165" fill="#cbd5e1" fontSize="9" fontFamily="sans-serif">
              K+N • Rhine Corridor • 45%
            </text>
          </g>

          {/* Hub Nodes */}
          {HUBS.map((hub) => (
            <g
              key={hub.id}
              className="cursor-pointer transition-transform duration-150 hover:scale-110"
              onMouseEnter={() => setActiveHoverHub(hub)}
              onMouseLeave={() => setActiveHoverHub(null)}
              onClick={() => setActiveTab('warehouses')}
            >
              {hub.isMainHub && (
                <circle cx={hub.x} cy={hub.y} r="18" fill="#3b82f6" fillOpacity="0.15" />
              )}
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.isMainHub ? 8 : 5}
                fill={hub.isMainHub ? '#3b82f6' : '#64748b'}
                stroke="#0f172a"
                strokeWidth="2"
              />
              <text
                x={hub.x}
                y={hub.y - 12}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={hub.isMainHub ? '12' : '10'}
                fontWeight={hub.isMainHub ? 'bold' : 'normal'}
              >
                {hub.name}
              </text>
              <text
                x={hub.x}
                y={hub.y + 20}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
              >
                {hub.code}
              </text>
            </g>
          ))}
        </svg>

        {/* Live Truck Telemetry Card Overlay on bottom-left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 max-w-xs text-xs space-y-1.5 shadow-xl hidden md:block">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono-code">
            <span className="font-bold text-blue-400">FREIGHT TELEMATICS</span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white font-mono-code">TRK-45872</span>
            </div>
            <span className="text-emerald-400 font-bold font-mono-code">78% Progress</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span>Speed: <strong className="text-white font-mono-code">84 km/h</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>ETA: <strong className="text-white font-mono-code">18:40 CEST</strong></span>
            </div>
          </div>
        </div>

        {/* Hovered Hub Info Banner */}
        {activeHoverHub && (
          <div className="absolute top-3 right-3 bg-blue-950/90 border border-blue-500/50 rounded-xl p-3 text-xs space-y-1 animate-in fade-in shadow-xl">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeHoverHub.name} ({activeHoverHub.country})</span>
            </div>
            <div className="text-[11px] text-blue-200">
              Distribution Hub Code: <strong className="font-mono-code text-white">{activeHoverHub.code}</strong>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Automated ASRS + Cross-docking</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
