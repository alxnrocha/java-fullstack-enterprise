import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Truck, 
  Radio, 
  Clock, 
  Gauge, 
  ExternalLink 
} from 'lucide-react';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const EuropeRouteMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { setSelectedShipmentTracking, setActiveTab } = useSupplyChainStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // prevent double initialization

    // 1. Initialize Leaflet Map with smooth interaction
    const map = L.map(mapContainerRef.current, {
      center: [47.5, 4.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Auto-fit western and central European corridor bounds
    map.fitBounds(
      [
        [40.0, -4.5], // Southwest (Madrid / Iberian Peninsula)
        [53.2, 14.5], // Northeast (North Sea / Berlin)
      ],
      { padding: [35, 35] }
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

    // 3. Geographically Exact Logistics Hub Coordinates
    const hubs = [
      { 
        name: 'Rotterdam Central', 
        code: 'W-ROT-01', 
        lat: 51.8900, 
        lng: 4.3100, // Maasvlakte / Port of Rotterdam, clearly south of The Hague
        isMain: true,
        labelDirection: 'bottom'
      },
      { 
        name: 'Frankfurt Terminal', 
        code: 'W-FRA-03', 
        lat: 50.0330, 
        lng: 8.5700, // Frankfurt Airport CargoCity South
        isMain: true,
        labelDirection: 'bottom'
      },
      { 
        name: 'Barcelona Hub', 
        code: 'W-BCN-02', 
        lat: 41.3400, 
        lng: 2.1400, // Port of Barcelona / Zona Franca
        isMain: true,
        labelDirection: 'top'
      },
      { 
        name: 'Paris Gateway', 
        code: 'GW-PAR-01', 
        lat: 49.0097, 
        lng: 2.5479, // Roissy Charles-de-Gaulle Cargo
        isMain: false,
        labelDirection: 'left'
      },
      { 
        name: 'Milan Transit', 
        code: 'GW-MIL-02', 
        lat: 45.4700, 
        lng: 9.3000, // Interporto di Milano / Segrate Freight Terminal
        isMain: false,
        labelDirection: 'bottom'
      },
      { 
        name: 'London Gateway', 
        code: 'GW-LON-03', 
        lat: 51.5050, 
        lng: 0.4700, // DP World London Gateway Deep Sea Port (Thames Estuary, Essex)
        isMain: false,
        labelDirection: 'left'
      },
      { 
        name: 'Berlin Hub', 
        code: 'GW-BER-04', 
        lat: 52.3600, 
        lng: 13.3100, // GVZ Berlin South Großbeeren Freight Terminal
        isMain: false,
        labelDirection: 'top'
      },
      { 
        name: 'Madrid Hub', 
        code: 'GW-MAD-05', 
        lat: 40.4200, 
        lng: -3.5300, // Puerto Seco de Madrid / Coslada Transport Platform
        isMain: false,
        labelDirection: 'bottom'
      }
    ];

    // Add Hub Markers with custom DivIcon and collision-free positioning
    hubs.forEach((hub) => {
      const hubHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
          <div style="
            width: ${hub.isMain ? '13px' : '9px'}; 
            height: ${hub.isMain ? '13px' : '9px'}; 
            border-radius: 50%; 
            background: ${hub.isMain ? '#3B82F6' : '#64748B'}; 
            border: 2px solid #FFFFFF; 
            box-shadow: 0 0 10px ${hub.isMain ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.6)'};
          "></div>
          <div style="
            background: rgba(15, 23, 42, 0.94); 
            border: 1px solid #334155; 
            border-radius: 4px; 
            padding: 1.5px 5px; 
            margin-top: 3px; 
            white-space: nowrap;
            color: #FFFFFF; 
            font-size: ${hub.isMain ? '10px' : '9px'}; 
            font-weight: 700;
            box-shadow: 0 2px 6px rgba(0,0,0,0.7);
          ">
            ${hub.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: hubHtml,
        className: 'custom-hub-marker',
        iconSize: [0, 0],
      });

      const marker = L.marker([hub.lat, hub.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0; font-size: 12px; font-weight: 800; color: #60A5FA;">${hub.name}</h4>
          <p style="margin: 2px 0 0; font-size: 10px; color: #94A3B8;">Code: <strong style="color: #FFF;">${hub.code}</strong></p>
          <p style="margin: 2px 0 0; font-size: 10px; color: #10B981; font-weight: 600;">● Operational • Cross-docking Active</p>
        </div>
      `);
    });

    // 4. Real Freight Transit Corridors (Polylines along actual European Motorways)
    // Corridor 1: Rotterdam -> Antwerp -> Brussels -> Paris -> Lyon -> Barcelona (Western Arterial)
    const routeRotterdamBarcelona: [number, number][] = [
      [51.8900, 4.3100], // Rotterdam Port
      [51.2194, 4.4025], // Antwerp
      [50.8503, 4.3517], // Brussels
      [49.0097, 2.5479], // Paris CDG
      [45.7500, 4.8500], // Lyon
      [44.1300, 4.8000], // Orange / Rhone Valley
      [42.7000, 2.8900], // Perpignan
      [41.3400, 2.1400]  // Barcelona Port
    ];
    L.polyline(routeRotterdamBarcelona, {
      color: '#3B82F6',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 6',
    }).addTo(map);

    // Corridor 2: Rotterdam -> Duisburg -> Cologne -> Frankfurt -> Nuremberg -> Berlin (Industrial Axis)
    const routeRotterdamBerlin: [number, number][] = [
      [51.8900, 4.3100], // Rotterdam Port
      [51.4416, 5.4697], // Eindhoven
      [50.9375, 6.9603], // Cologne
      [50.0330, 8.5700], // Frankfurt CargoCity
      [49.4521, 11.0767], // Nuremberg
      [51.3397, 12.3731], // Leipzig
      [52.3600, 13.3100]  // Berlin GVZ
    ];
    L.polyline(routeRotterdamBerlin, {
      color: '#10B981',
      weight: 3,
      opacity: 0.85,
      dashArray: '5, 5',
    }).addTo(map);

    // Corridor 3: Frankfurt -> Basel -> Lucerne -> Milan (Trans-Alpine Axis)
    const routeFrankfurtMilan: [number, number][] = [
      [50.0330, 8.5700], // Frankfurt CargoCity
      [47.5596, 7.5886], // Basel
      [46.2044, 8.9500], // Gotthard / Ticino
      [45.4700, 9.3000]  // Milan Interporto
    ];
    L.polyline(routeFrankfurtMilan, {
      color: '#8B5CF6',
      weight: 2.5,
      opacity: 0.75,
      dashArray: '4, 4',
    }).addTo(map);

    // 5. Active Moving Trucks with Anti-Collision Anchoring!
    // Truck 1: TRK-45872 (DHL Freight) in Rhone Valley (South of Lyon)
    // Anchored pointing WEST toward Central France (Zero overlap with Italy or Milan!)
    const truck1Html = `
      <div style="cursor: pointer; transform: translate(-100%, -50%); display: flex; flex-direction: row; align-items: center; gap: 6px;">
        <div style="
          background: rgba(15, 23, 42, 0.95); 
          border: 1px solid #3B82F6; 
          border-radius: 6px; 
          padding: 2.5px 7px; 
          white-space: nowrap; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        ">
          <div style="color: #60A5FA; font-family: monospace; font-size: 10px; font-weight: 800;">TRK-45872 (84 km/h)</div>
          <div style="color: #94A3B8; font-size: 8.5px;">DHL Express &bull; Rhone Corridor &bull; 78%</div>
        </div>
        <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; shrink-0;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: #3B82F6; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 9px; height: 9px; border-radius: 50%; background: #2563EB; border: 2px solid #FFFFFF; z-index: 10;"></div>
        </div>
      </div>
    `;
    const truck1Icon = L.divIcon({ html: truck1Html, className: 'truck-marker-1', iconSize: [0, 0] });
    const truck1 = L.marker([45.1500, 4.8400], { icon: truck1Icon }).addTo(map);
    truck1.on('click', () => {
      setSelectedShipmentTracking('TRK-45872');
      setActiveTab('tracking');
    });

    // Truck 2: TRK-88491 (Kuehne + Nagel) in Rhine Valley near Bonn
    // Anchored pointing NORTH toward Cologne/Ruhr (Zero overlap with Frankfurt!)
    const truck2Html = `
      <div style="cursor: pointer; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="
          background: rgba(15, 23, 42, 0.95); 
          border: 1px solid #10B981; 
          border-radius: 6px; 
          padding: 2.5px 7px; 
          white-space: nowrap; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        ">
          <div style="color: #34D399; font-family: monospace; font-size: 10px; font-weight: 800;">TRK-88491 (91 km/h)</div>
          <div style="color: #94A3B8; font-size: 8.5px;">K+N Logistics &bull; Rhine Corridor &bull; 45%</div>
        </div>
        <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: #10B981; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 9px; height: 9px; border-radius: 50%; background: #059669; border: 2px solid #FFFFFF; z-index: 10;"></div>
        </div>
      </div>
    `;
    const truck2Icon = L.divIcon({ html: truck2Html, className: 'truck-marker-2', iconSize: [0, 0] });
    const truck2 = L.marker([50.6800, 7.1500], { icon: truck2Icon }).addTo(map);
    truck2.on('click', () => {
      setSelectedShipmentTracking('TRK-88491');
      setActiveTab('tracking');
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setActiveTab, setSelectedShipmentTracking]);

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

        {/* Live Truck Telemetry Card Overlay on bottom-left */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 max-w-xs text-xs space-y-1.5 shadow-xl hidden sm:block">
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
      </div>
    </div>
  );
};
