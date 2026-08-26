import React from 'react';
import { 
  DollarSign, 
  Truck, 
  CheckCircle, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { DashboardSummary } from '../../types/index.ts';

interface KpiCardsProps {
  summary: DashboardSummary | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary }) => {
  const valuation = summary ? (summary.totalInventoryValuation / 1_000_000).toFixed(2) : '48.92';
  const activeShipments = summary?.activeShipmentsCount ? summary.activeShipmentsCount.toLocaleString() : '1,428';
  const sla = summary?.orderFulfillmentSlaRate ? summary.orderFulfillmentSlaRate.toFixed(1) : '99.4';
  const utilization = summary?.warehouseUtilizationIndex ? summary.warehouseUtilizationIndex.toFixed(1) : '87.2';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Valuation */}
      <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inventory Valuation</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
            ${valuation}M
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+$1.2M vs last month (+2.5%)</span>
          </div>
        </div>
      </div>

      {/* 2. Active Shipments */}
      <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Freight Shipments</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
            {activeShipments} <span className="text-sm font-semibold text-slate-400">units</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>82 in transit</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600 font-semibold">14 customs hold</span>
          </div>
        </div>
      </div>

      {/* 3. SLA Rate */}
      <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Fulfillment SLA</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
            {sla}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+0.3% vs target SLA (99.1%)</span>
          </div>
        </div>
      </div>

      {/* 4. Capacity Index */}
      <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse Capacity Index</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
            {utilization}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Frankfurt at 94% (Near Cap)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
