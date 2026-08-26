import { useEffect, useState } from 'react';
import { 
  Download, 
  RefreshCw, 
  Calendar
} from 'lucide-react';
import { DashboardSummary } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { KpiCards } from './KpiCards.tsx';
import { EuropeRouteMap } from './EuropeRouteMap.tsx';
import { StockAlertsCard } from './StockAlertsCard.tsx';
import { OutboxStreamCard } from './OutboxStreamCard.tsx';
import { ThroughputCharts } from './ThroughputCharts.tsx';

export const ExecutiveDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Executive Supply Chain Overview
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
            Real-time visibility across European distribution hubs & freight logistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh Live Metrics"
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last 24 Hours</span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <KpiCards summary={summary} />

      {/* Interactive European Route Network Map */}
      <EuropeRouteMap />

      {/* Stock Alerts & Outbox Event Stream Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockAlertsCard 
          alerts={summary?.stockAlerts || []} 
          onReplenished={loadData}
        />
        <OutboxStreamCard 
          events={summary?.recentOutboxEvents || []} 
        />
      </div>

      {/* Throughput & Capacity Charts */}
      <ThroughputCharts warehouses={summary?.warehouses || []} />
    </div>
  );
};
