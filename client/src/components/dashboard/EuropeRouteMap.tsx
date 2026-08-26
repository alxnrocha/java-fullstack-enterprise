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

// Geographically accurate hub coordinates across a 900x480 European projection
const HUBS: MapHub[] = [
  { id: 'h1', name: 'Rotterdam Central', code: 'W-ROT-01', country: 'NL', x: 380, y: 120, isMainHub: true, status: 'OPTIMAL' },
  { id: 'h2', name: 'Frankfurt Terminal', code: 'W-FRA-03', country: 'DE', x: 490, y: 160, isMainHub: true, status: 'HIGH_CAPACITY' },
  { id: 'h3', name: 'Barcelona Hub', code: 'W-BCN-02', country: 'ES', x: 270, y: 390, isMainHub: true, status: 'OPTIMAL' },
  { id: 'h4', name: 'Paris Gateway', code: 'GW-PAR-01', country: 'FR', x: 320, y: 200, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h5', name: 'Milan Transit', code: 'GW-MIL-02', country: 'IT', x: 530, y: 280, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h6', name: 'London Gateway', code: 'GW-LON-03', country: 'UK', x: 230, y: 130, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h7', name: 'Berlin Hub', code: 'GW-BER-04', country: 'DE', x: 610, y: 110, isMainHub: false, status: 'OPTIMAL' },
  { id: 'h8', name: 'Madrid Central', code: 'GW-MAD-05', country: 'ES', x: 170, y: 410, isMainHub: false, status: 'OPTIMAL' }
];

export const EuropeRouteMap: React.FC = () => {
  const { setSelectedShipmentTracking, setActiveTab } = useSupplyChainStore();
  const [activeHoverHub, setActiveHoverHub] = useState<MapHub | null>(null);

  return (
    <div className="clean-card bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white overflow-hidden shadow-lg relative">
      {/* Map Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 z-10 relative">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              European Logistics Corridors & Fleet Positioning
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30 whitespace-nowrap">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium pl-10.5">
            Real-time GPS tracking via IoT telematics & AMQP message queues across continental corridors
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono-code">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Active Fleet:</span>
            <span className="font-bold text-emerald-400">82 In Transit</span>
          </div>

          <button 
            onClick={() => setActiveTab('tracking')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-xs"
          >
            <span>Full Radar View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas with Realistic European Silhouette */}
      <div className="relative w-full aspect-21/9 min-h-[340px] max-h-[420px] bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
        {/* Background Coordinate Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="radar-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#475569" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#radar-grid)" />
        </svg>

        <svg viewBox="0 0 900 480" className="w-full h-full">
          <defs>
            {/* Glowing filter for active freight corridors */}
            <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradient for North-South Transit Corridor */}
            <linearGradient id="route-gradient-ns" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="route-gradient-ew" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* EUROPEAN LANDMASS SILHOUETTES (Clean vector paths) */}
          {/* ======================================================== */}
          <g fill="#1e293b" stroke="#334155" strokeWidth="1.5" opacity="0.85">
            {/* British Isles (UK & Ireland) */}
            <path d="M 180,90 C 200,70 230,80 250,110 C 260,130 250,160 230,170 C 200,160 190,130 180,90 Z" />
            <path d="M 140,110 C 160,100 170,120 160,140 C 140,150 130,130 140,110 Z" />

            {/* Iberian Peninsula (Spain & Portugal) */}
            <path d="M 120,360 C 160,340 220,350 260,360 C 300,370 310,410 270,440 C 210,460 140,440 120,400 Z" />

            {/* France & Benelux Continental Coastline */}
            <path d="M 260,360 C 260,300 290,230 310,180 C 350,130 400,100 420,110 C 440,140 420,190 390,260 C 360,320 310,360 260,360 Z" />

            {/* Central Europe (Germany, Austria, Czechia, Poland) */}
            <path d="M 420,110 C 460,80 540,70 630,90 C 650,140 620,200 580,220 C 510,230 450,210 420,110 Z" />

            {/* Italian Peninsula & Alps */}
            <path d="M 450,230 C 500,240 560,250 540,290 C 520,330 550,380 580,420 C 560,430 530,370 500,310 C 460,280 440,250 450,230 Z" />

            {/* Scandinavia & Baltic Silhouette (faint outline in background) */}
            <path d="M 480,50 C 520,20 600,10 650,40 C 620,70 540,70 480,50 Z" opacity="0.5" />
          </g>

          {/* ======================================================== */}
          {/* ACTIVE LOGISTICS FREIGHT ARTERIES (Curved Neon Corridors) */}
          {/* ======================================================== */}
          {/* 1. Main Western Spine: Rotterdam -> Paris -> Lyon -> Barcelona */}
          <path 
            d="M 380,120 Q 340,160 320,200 T 360,290 T 270,390" 
            stroke="url(#route-gradient-ns)" 
            strokeWidth="3" 
            fill="none" 
            strokeDasharray="6 4"
            filter="url(#corridor-glow)"
          />

          {/* 2. Rhine-Danube Industrial Axis: Rotterdam -> Frankfurt -> Berlin */}
          <path 
            d="M 380,120 Q 440,135 490,160 T 610,110" 
            stroke="url(#route-gradient-ew)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeDasharray="5 3"
          />

          {/* 3. Alpine Corridor: Frankfurt -> Milan */}
          <path 
            d="M 490,160 Q 520,220 530,280" 
            stroke="#3b82f6" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* 4. Channel Maritime Link: London -> Rotterdam */}
          <path 
            d="M 230,130 Q 300,115 380,120" 
            stroke="#0ea5e9" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="6 4"
            opacity="0.7"
          />

          {/* 5. Iberian Inland Corridor: Barcelona -> Madrid */}
          <path 
            d="M 270,390 Q 220,395 170,410" 
            stroke="#10b981" 
            strokeWidth="2" 
            fill="none" 
            strokeDasharray="4 4"
            opacity="0.7"
          />

          {/* ======================================================== */}
          {/* LIVE MOVING CARGO TRUCKS & SATELLITE POSITIONING */}
          {/* ======================================================== */}

          {/* Truck 1: TRK-45872 (DHL Freight) in Lyon/Rhone sector */}
          <g 
            className="cursor-pointer group"
            onClick={() => {
              setSelectedShipmentTracking('TRK-45872');
              setActiveTab('tracking');
            }}
          >
            {/* Animated Radar Pulse */}
            <circle cx="340" cy="315" r="16" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
            <circle cx="340" cy="315" r="8" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            
            {/* Floating Tag with background pill (prevents any collision!) */}
            <g transform="translate(355, 300)">
              <rect x="0" y="-12" width="130" height="28" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#3b82f6" strokeWidth="1" />
              <text x="8" y="1" fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="monospace">
                TRK-45872 (84 km/h)
              </text>
              <text x="8" y="11" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                DHL • Lyon Corridor • 78%
              </text>
            </g>
          </g>

          {/* Truck 2: TRK-88491 (Kuehne + Nagel) along Rhine Sector */}
          <g 
            className="cursor-pointer group"
            onClick={() => {
              setSelectedShipmentTracking('TRK-88491');
              setActiveTab('tracking');
            }}
          >
            <circle cx="440" cy="142" r="14" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle cx="440" cy="142" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />

            <g transform="translate(455, 125)">
              <rect x="0" y="-12" width="135" height="28" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#10b981" strokeWidth="1" />
              <text x="8" y="1" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                TRK-88491 (91 km/h)
              </text>
              <text x="8" y="11" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
                K+N • Rhine Sector • 45%
              </text>
            </g>
          </g>

          {/* ======================================================== */}
          {/* DISTRIBUTION HUBS (Clearly anchored with clean badges) */}
          {/* ======================================================== */}
          {HUBS.map((hub) => (
            <g
              key={hub.id}
              className="cursor-pointer transition-transform duration-150 hover:scale-105"
              onMouseEnter={() => setActiveHoverHub(hub)}
              onMouseLeave={() => setActiveHoverHub(null)}
              onClick={() => setActiveTab('warehouses')}
            >
              {hub.isMainHub && (
                <circle cx={hub.x} cy={hub.y} r="20" fill="#3b82f6" fillOpacity="0.12" />
              )}
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.isMainHub ? 8 : 5}
                fill={hub.isMainHub ? '#3b82f6' : '#64748b'}
                stroke="#0f172a"
                strokeWidth="2.5"
              />

              {/* Node Badge Pill for legibility */}
              <g transform={`translate(${hub.x}, ${hub.y - (hub.isMainHub ? 16 : 12)})`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={hub.isMainHub ? '11' : '9.5'}
                  fontWeight={hub.isMainHub ? 'bold' : '600'}
                  className="select-none"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {hub.name}
                </text>
              </g>

              <text
                x={hub.x}
                y={hub.y + 16}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8.5"
                fontFamily="monospace"
                className="select-none"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
              >
                {hub.code}
              </text>
            </g>
          ))}
        </svg>

        {/* Live Truck Telemetry Card Overlay on bottom-left */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 max-w-xs text-xs space-y-1.5 shadow-xl hidden sm:block">
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
