import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Warehouse } from '../../types/index.ts';

const throughputData = [
  { time: '00:00', messages: 8400, latencyMs: 12.4 },
  { time: '04:00', messages: 6200, latencyMs: 11.2 },
  { time: '08:00', messages: 14500, latencyMs: 16.8 },
  { time: '12:00', messages: 18200, latencyMs: 15.5 },
  { time: '16:00', messages: 16900, latencyMs: 14.1 },
  { time: '20:00', messages: 11200, latencyMs: 12.9 },
  { time: 'Now', messages: 12500, latencyMs: 13.2 }
];

interface ThroughputChartsProps {
  warehouses: Warehouse[];
}

export const ThroughputCharts: React.FC<ThroughputChartsProps> = ({ warehouses }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Dual Axis Chart: Messages & Latency */}
      <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">AMQP Message Throughput & Outbox Publishing Latency</h3>
            <p className="text-[11px] text-slate-500 font-medium">Hourly telemetry from RabbitMQ exchanges and atomic Postgres pollers</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono-code">
            <span className="flex items-center gap-1 text-blue-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Msgs / Hour
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-2.5 h-1 rounded-full bg-emerald-500"></span> Latency (ms)
            </span>
          </div>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} unit="ms" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#1e293b', 
                  borderRadius: '0.75rem', 
                  color: '#fff', 
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Bar yAxisId="left" dataKey="messages" name="Events Published" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Line yAxisId="right" type="monotone" dataKey="latencyMs" name="Avg Latency (ms)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warehouse Capacity Matrix Progress Cards */}
      <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Hub Storage Utilization</h3>
            <p className="text-[11px] text-slate-500 font-medium">Pallet capacity across European logistics centers</p>
          </div>

          <div className="space-y-4 mt-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 font-bold">{wh.name}</span>
                  <span className="font-mono-code text-slate-600">
                    {wh.currentUtilization.toLocaleString()} / {wh.capacityPallets.toLocaleString()} ({wh.utilizationPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      wh.utilizationPercent >= 85 
                        ? 'bg-amber-500' 
                        : wh.utilizationPercent >= 90 
                          ? 'bg-rose-500' 
                          : 'bg-blue-600'
                    }`}
                    style={{ width: `${wh.utilizationPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono-code">
                  <span>Hub: {wh.code}</span>
                  <span className={wh.utilizationPercent >= 85 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {wh.utilizationPercent >= 85 ? 'Near Capacity' : 'Optimal Capacity'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Global Capacity Index</span>
          <span className="font-mono-code font-bold text-blue-600 text-sm">82.8% Average</span>
        </div>
      </div>
    </div>
  );
};
