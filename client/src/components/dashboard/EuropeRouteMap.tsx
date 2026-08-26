import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Truck, 
  Radio, 
  Clock, 
  Gauge, 
  ExternalLink,
  Fuel,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

interface ActiveTruckTelemetry {
  id: string;
  trackingNumber: string;
  carrier: string;
  corridor: string;
  speedKmh: number;
  progressPercent: number;
  fuelPercent: number;
  tempCelsius: number;
  eta: string;
  lat: number;
  lng: number;
  color: string;
}

const TRUCKS: ActiveTruckTelemetry[] = [
  {
    id: 'trk-1',
    trackingNumber: 'TRK-45872',
    carrier: 'DHL Freight Express',
    corridor: 'Rhône Valley &bull; A7',
    speedKmh: 84,
    progressPercent: 78,
    fuelPercent: 76,
    tempCelsius: 19.2,
    eta: '18:40 CEST',
    lat: 45.3000,
    lng: 4.8200,
    color: '#3B82F6'
  },
  {
    id: 'trk-2',
    trackingNumber: 'TRK-88491',
    carrier: 'Kuehne + Nagel Logistics',
    corridor: 'Rhine Industrial &bull; A3',
    speedKmh: 91,
    progressPercent: 45,
    fuelPercent: 68,
    tempCelsius: 18.5,
    eta: '21:15 CEST',
    lat: 50.6800,
    lng: 7.1500,
    color: '#10B981'
  }
];

export const EuropeRouteMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { setSelectedShipmentTracking, setActiveTab } = useSupplyChainStore();
  const [selectedTruck, setSelectedTruck] = useState<ActiveTruckTelemetry>(TRUCKS[0]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // prevent duplicate initialization

    // 1. Initialize Leaflet Map with smooth interactive dragging
    const map = L.map(mapContainerRef.current, {
      center: [47.5, 4.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Fit Western & Central European corridor bounds adaptively
    map.fitBounds(
      [
        [39.8, -5.0], // Southwest (Spain/Madrid)
        [53.4, 14.5], // Northeast (Berlin/North Sea)
      ],
      { padding: [30, 30] }
    );

    // 2. High-Definition ESRI Dark Gray Canvas Base (Official, No Watermark, No Key)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri, DeLorme, NAVTEQ &bull; OpenStreetMap',
        maxZoom: 16,
      }
    ).addTo(map);

    // Complementary Reference Layer (Geographic borders, coastlines, and major cities)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
      }
    ).addTo(map);

    // 3. European Logistics Hubs (Micro-Capsule Pins - ZERO Collisions!)
    const hubs = [
      { code: 'ROT', name: 'Rotterdam Central', desc: 'W-ROT-01 • Deep Sea Hub', lat: 51.8900, lng: 4.3100, isMain: true },
      { code: 'FRA', name: 'Frankfurt Terminal', desc: 'W-FRA-03 • CargoCity South', lat: 50.0330, lng: 8.5700, isMain: true },
      { code: 'BCN', name: 'Barcelona Hub', desc: 'W-BCN-02 • Zona Franca Port', lat: 41.3400, lng: 2.1400, isMain: true },
      { code: 'PAR', name: 'Paris Gateway', desc: 'GW-PAR-01 • Roissy CDG Cargo', lat: 49.0097, lng: 2.5479, isMain: false },
      { code: 'MIL', name: 'Milan Transit', desc: 'GW-MIL-02 • Interporto Segrate', lat: 45.4700, lng: 9.3000, isMain: false },
      { code: 'LON', name: 'London Gateway', desc: 'GW-LON-03 • DP World Essex', lat: 51.5050, lng: 0.4700, isMain: false },
      { code: 'BER', name: 'Berlin Hub', desc: 'GW-BER-04 • GVZ South Großbeeren', lat: 52.3600, lng: 13.3100, isMain: false },
      { code: 'MAD', name: 'Madrid Central', desc: 'GW-MAD-05 • Coslada Dry Port', lat: 40.4200, lng: -3.5300, isMain: false }
    ];

    // Add Clean Circular Badge Markers
    hubs.forEach((hub) => {
      const hubHtml = `
        <div style="
          cursor: pointer; 
          transform: translate(-50%, -50%); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          width: ${hub.isMain ? '26px' : '22px'}; 
          height: ${hub.isMain ? '26px' : '22px'}; 
          border-radius: 9999px; 
          background: ${hub.isMain ? '#1E293B' : '#0F172A'}; 
          border: 1.5px solid ${hub.isMain ? '#3B82F6' : '#64748B'}; 
          color: ${hub.isMain ? '#60A5FA' : '#CBD5E1'}; 
          font-family: monospace; 
          font-size: ${hub.isMain ? '10px' : '9px'}; 
          font-weight: 800; 
          box-shadow: 0 0 10px ${hub.isMain ? 'rgba(59, 130, 246, 0.7)' : 'rgba(0,0,0,0.5)'};
          transition: transform 0.15s ease;
        ">
          ${hub.code}
        </div>
      `;

      const icon = L.divIcon({
        html: hubHtml,
        className: 'hub-chip-marker',
        iconSize: [0, 0],
      });

      const marker = L.marker([hub.lat, hub.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; min-width: 140px;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 6px;">
            <strong style="color: #60A5FA; font-size: 12px;">${hub.name}</strong>
            <span style="background: rgba(59, 130, 246, 0.2); color: #93C5FD; font-family: monospace; font-size: 9px; padding: 1px 4px; border-radius: 4px;">${hub.code}</span>
          </div>
          <p style="margin: 3px 0 0; font-size: 10px; color: #94A3B8;">${hub.desc}</p>
          <p style="margin: 4px 0 0; font-size: 10px; color: #10B981; font-weight: 600;">● ASRS Automation Active</p>
        </div>
      `);
    });

    // 4. Real Freight Transit Corridors (Neon Arteries)
    // Corridor 1: Rotterdam -> Antwerp -> Brussels -> Paris -> Lyon -> Barcelona (West Spine)
    const routeRotterdamBarcelona: [number, number][] = [
      [51.8900, 4.3100],
      [51.2194, 4.4025],
      [50.8503, 4.3517],
      [49.0097, 2.5479],
      [45.7500, 4.8500],
      [44.1300, 4.8000],
      [42.7000, 2.8900],
      [41.3400, 2.1400]
    ];
    L.polyline(routeRotterdamBarcelona, {
      color: '#3B82F6',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 6',
    }).addTo(map);

    // Corridor 2: Rotterdam -> Duisburg -> Cologne -> Frankfurt -> Nuremberg -> Berlin (Industrial Axis)
    const routeRotterdamBerlin: [number, number][] = [
      [51.8900, 4.3100],
      [51.4416, 5.4697],
      [50.9375, 6.9603],
      [50.0330, 8.5700],
      [49.4521, 11.0767],
      [51.3397, 12.3731],
      [52.3600, 13.3100]
    ];
    L.polyline(routeRotterdamBerlin, {
      color: '#10B981',
      weight: 3,
      opacity: 0.85,
      dashArray: '5, 5',
    }).addTo(map);

    // Corridor 3: Frankfurt -> Basel -> Lucerne -> Milan (Trans-Alpine Axis)
    const routeFrankfurtMilan: [number, number][] = [
      [50.0330, 8.5700],
      [47.5596, 7.5886],
      [46.2044, 8.9500],
      [45.4700, 9.3000]
    ];
    L.polyline(routeFrankfurtMilan, {
      color: '#8B5CF6',
      weight: 2.5,
      opacity: 0.75,
      dashArray: '4, 4',
    }).addTo(map);

    // 5. Active Moving Trucks (Clean Animated Radar Capsule Pins - NO Cluttered Billboards!)
    TRUCKS.forEach((truck) => {
      const truckHtml = `
        <div style="cursor: pointer; transform: translate(-50%, -50%); position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute; 
            inset: 0; 
            border-radius: 50%; 
            background: ${truck.color}; 
            opacity: 0.45; 
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: ${truck.color}; 
            border: 2px solid #FFFFFF; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: #FFFFFF; 
            box-shadow: 0 0 12px ${truck.color}; 
            z-index: 10;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({ html: truckHtml, className: `truck-pin-${truck.id}`, iconSize: [0, 0] });
      const marker = L.marker([truck.lat, truck.lng], { icon: truckIcon }).addTo(map);

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif; min-width: 160px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong style="color: ${truck.color}; font-family: monospace; font-size: 12px;">${truck.trackingNumber}</strong>
            <span style="font-size: 10px; color: #10B981; font-weight: bold;">${truck.speedKmh} km/h</span>
          </div>
          <p style="margin: 2px 0 0; font-size: 10px; color: #E2E8F0;">${truck.carrier}</p>
          <p style="margin: 2px 0 0; font-size: 9.5px; color: #94A3B8;">Corridor: ${truck.corridor}</p>
          <p style="margin: 4px 0 0; font-size: 10px; color: #60A5FA; font-weight: 600;">Progress: ${truck.progressPercent}% &bull; ETA ${truck.eta}</p>
        </div>
      `);

      marker.on('click', () => {
        setSelectedTruck(truck);
        setSelectedShipmentTracking(truck.trackingNumber);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setSelectedShipmentTracking]);

  const handleSelectTruck = (truck: ActiveTruckTelemetry) => {
    setSelectedTruck(truck);
    setSelectedShipmentTracking(truck.trackingNumber);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([truck.lat, truck.lng], { animate: true, duration: 0.8 });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white overflow-hidden shadow-lg relative">
      {/* Map Header - Pure Dark Mode with Crisp White Title and Aligned Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 z-10 relative">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                European Logistics Corridors &amp; Fleet Positioning
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold bg-blue-500/20 text-blue-400 border border-blue-400/30 whitespace-nowrap">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Real-time GPS tracking via IoT telematics &amp; AMQP message queues across continental corridors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono-code">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Active Fleet:</span>
            <span className="font-bold text-emerald-400">82 In Transit</span>
          </div>

          <button 
            onClick={() => setActiveTab('tracking')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-xs"
          >
            <span>Full Radar View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real Geographic Interactive Leaflet Container */}
      <div className="relative w-full aspect-21/9 min-h-[380px] max-h-[460px] rounded-xl border border-slate-800 overflow-hidden shadow-inner bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Interactive Floating Telemetry Control HUD (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3.5 max-w-sm text-xs space-y-2.5 shadow-2xl">
          {/* HUD Header with Truck Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              {TRUCKS.map((t) => {
                const isSelected = selectedTruck.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTruck(t)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t.trackingNumber}
                  </button>
                );
              })}
            </div>

            <span className="text-emerald-400 flex items-center gap-1 font-mono-code text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ONLINE
            </span>
          </div>

          {/* Active Unit Diagnostics */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white font-mono-code text-xs leading-none">
                    {selectedTruck.trackingNumber}
                  </h4>
                  <span className="text-[10px] text-slate-400">{selectedTruck.carrier}</span>
                </div>
              </div>
              <span className="text-emerald-400 font-bold font-mono-code text-xs">
                {selectedTruck.progressPercent}% Transit
              </span>
            </div>

            {/* Metric Gauges Grid */}
            <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-300 pt-2.5 mt-2 border-t border-slate-800/80">
              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1 text-slate-400">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  <span>Speed</span>
                </div>
                <div className="font-mono-code font-bold text-white mt-0.5">{selectedTruck.speedKmh} km/h</div>
              </div>

              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1 text-slate-400">
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span>Fuel</span>
                </div>
                <div className="font-mono-code font-bold text-white mt-0.5">{selectedTruck.fuelPercent}%</div>
              </div>

              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1 text-slate-400">
                  <Thermometer className="w-3.5 h-3 text-emerald-400" />
                  <span>Temp</span>
                </div>
                <div className="font-mono-code font-bold text-white mt-0.5">{selectedTruck.tempCelsius}°C</div>
              </div>

              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>ETA</span>
                </div>
                <div className="font-mono-code font-bold text-white mt-0.5">{selectedTruck.eta}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono-code">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Cold Chain Secure</span>
            </span>
            <span>AMQP Poller Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
