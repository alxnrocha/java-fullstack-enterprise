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
    if (mapInstanceRef.current) return; // prevent duplicate init

    // 1. Initialize Leaflet Map without generic zoom buttons
    const map = L.map(mapContainerRef.current, {
      center: [48.5, 4.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      zoomControl: false, // clean custom HUD
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // 2. High-Definition ESRI Dark Gray Canvas (Official, Public, No Watermark, No API Key)
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

    // 3. European Logistics Hub Coordinates
    const hubs = [
      { name: 'Rotterdam Central', code: 'W-ROT-01', lat: 51.9244, lng: 4.4777, isMain: true },
      { name: 'Frankfurt Terminal', code: 'W-FRA-03', lat: 50.1109, lng: 8.6821, isMain: true },
      { name: 'Barcelona Hub', code: 'W-BCN-02', lat: 41.3879, lng: 2.1699, isMain: true },
      { name: 'Paris Gateway', code: 'GW-PAR-01', lat: 48.8566, lng: 2.3522, isMain: false },
      { name: 'Milan Transit', code: 'GW-MIL-02', lat: 45.4642, lng: 9.1900, isMain: false },
      { name: 'London Gateway', code: 'GW-LON-03', lat: 51.5074, lng: -0.1278, isMain: false },
      { name: 'Berlin Hub', code: 'GW-BER-04', lat: 52.5200, lng: 13.4050, isMain: false },
      { name: 'Madrid Hub', code: 'GW-MAD-05', lat: 40.4168, lng: -3.7038, isMain: false }
    ];

    // Add Hub Markers with custom DivIcon
    hubs.forEach((hub) => {
      const hubHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
          <div style="
            width: ${hub.isMain ? '14px' : '10px'}; 
            height: ${hub.isMain ? '14px' : '10px'}; 
            border-radius: 50%; 
            background: ${hub.isMain ? '#3B82F6' : '#64748B'}; 
            border: 2px solid #FFFFFF; 
            box-shadow: 0 0 12px ${hub.isMain ? 'rgba(59, 130, 246, 0.9)' : 'rgba(100, 116, 139, 0.6)'};
          "></div>
          <div style="
            background: rgba(15, 23, 42, 0.92); 
            border: 1px solid #334155; 
            border-radius: 5px; 
            padding: 2px 6px; 
            margin-top: 4px; 
            white-space: nowrap;
            color: #FFFFFF; 
            font-size: ${hub.isMain ? '11px' : '9.5px'}; 
            font-weight: 700;
            box-shadow: 0 4px 8px rgba(0,0,0,0.6);
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
        <div style="padding: 6px; font-family: sans-serif;">
          <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #60A5FA;">${hub.name}</h4>
          <p style="margin: 3px 0 0; font-size: 11px; color: #94A3B8;">Code: <strong style="color: #FFF;">${hub.code}</strong></p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #10B981; font-weight: 600;">● Operational • Cross-docking Active</p>
        </div>
      `);
    });

    // 4. Real Freight Transit Corridors (Polylines)
    // Corridor 1: Rotterdam -> Antwerp -> Paris -> Lyon -> Barcelona (West Spine)
    const routeRotterdamBarcelona: [number, number][] = [
      [51.9244, 4.4777],
      [51.2194, 4.4025],
      [48.8566, 2.3522],
      [45.7640, 4.8357],
      [43.6047, 1.4442],
      [41.3879, 2.1699]
    ];
    L.polyline(routeRotterdamBarcelona, {
      color: '#3B82F6',
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 6',
    }).addTo(map);

    // Corridor 2: Rotterdam -> Eindhoven -> Cologne -> Frankfurt -> Nuremberg -> Berlin (Industrial Axis)
    const routeRotterdamBerlin: [number, number][] = [
      [51.9244, 4.4777],
      [51.4416, 5.4697],
      [50.9375, 6.9603],
      [50.1109, 8.6821],
      [49.4521, 11.0767],
      [52.5200, 13.4050]
    ];
    L.polyline(routeRotterdamBerlin, {
      color: '#10B981',
      weight: 3,
      opacity: 0.85,
      dashArray: '5, 5',
    }).addTo(map);

    // Corridor 3: Frankfurt -> Basel -> Milan (Alpine Axis)
    const routeFrankfurtMilan: [number, number][] = [
      [50.1109, 8.6821],
      [47.5596, 7.5886],
      [45.4642, 9.1900]
    ];
    L.polyline(routeFrankfurtMilan, {
      color: '#8B5CF6',
      weight: 2.5,
      opacity: 0.75,
      dashArray: '4, 4',
    }).addTo(map);

    // 5. Active Moving Trucks (Live Telemetry Markers)
    // Truck 1: TRK-45872 (DHL Freight) in Rhone Valley near Lyon
    const truck1Html = `
      <div style="cursor: pointer; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 8px;">
        <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: #3B82F6; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 11px; height: 11px; border-radius: 50%; background: #2563EB; border: 2px solid #FFFFFF; z-index: 10;"></div>
        </div>
        <div style="
          background: rgba(15, 23, 42, 0.95); 
          border: 1px solid #3B82F6; 
          border-radius: 6px; 
          padding: 3px 8px; 
          white-space: nowrap; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        ">
          <div style="color: #60A5FA; font-family: monospace; font-size: 11px; font-weight: 800;">TRK-45872 (84 km/h)</div>
          <div style="color: #94A3B8; font-size: 9px;">DHL Express &bull; Lyon Corridor &bull; 78%</div>
        </div>
      </div>
    `;
    const truck1Icon = L.divIcon({ html: truck1Html, className: 'truck-marker-1', iconSize: [0, 0] });
    const truck1 = L.marker([45.7640, 4.8357], { icon: truck1Icon }).addTo(map);
    truck1.on('click', () => {
      setSelectedShipmentTracking('TRK-45872');
      setActiveTab('tracking');
    });

    // Truck 2: TRK-88491 (Kuehne + Nagel) in Rhine Valley near Cologne
    const truck2Html = `
      <div style="cursor: pointer; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 8px;">
        <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: #10B981; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 11px; height: 11px; border-radius: 50%; background: #059669; border: 2px solid #FFFFFF; z-index: 10;"></div>
        </div>
        <div style="
          background: rgba(15, 23, 42, 0.95); 
          border: 1px solid #10B981; 
          border-radius: 6px; 
          padding: 3px 8px; 
          white-space: nowrap; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
        ">
          <div style="color: #34D399; font-family: monospace; font-size: 11px; font-weight: 800;">TRK-88491 (91 km/h)</div>
          <div style="color: #94A3B8; font-size: 9px;">K+N Logistics &bull; Rhine Corridor &bull; 45%</div>
        </div>
      </div>
    `;
    const truck2Icon = L.divIcon({ html: truck2Html, className: 'truck-marker-2', iconSize: [0, 0] });
    const truck2 = L.marker([50.6000, 7.3000], { icon: truck2Icon }).addTo(map);
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
