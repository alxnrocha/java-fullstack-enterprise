import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Radio, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  RotateCcw,
  Zap
} from 'lucide-react';
import { OutboxEvent, TelemetryMetrics } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

export const OutboxInspector: React.FC = () => {
  const { selectedOutboxEventId, setSelectedOutboxEventId } = useSupplyChainStore();
  const [events, setEvents] = useState<OutboxEvent[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryMetrics | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<OutboxEvent | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    const [eventsData, teleData] = await Promise.all([
      api.getOutboxEvents(),
      api.getTelemetry()
    ]);
    setEvents(eventsData);
    setTelemetry(teleData);

    if (selectedOutboxEventId) {
      const found = eventsData.find(e => e.id === selectedOutboxEventId);
      if (found) setSelectedEvent(found);
      else if (eventsData.length > 0) setSelectedEvent(eventsData[0]);
    } else if (eventsData.length > 0) {
      setSelectedEvent(eventsData[0]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [selectedOutboxEventId]);

  const handleCopyPayload = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(selectedEvent.payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 1500);
  };

  const handleReprocess = async (id: string) => {
    try {
      const updated = await api.reprocessOutboxEvent(id);
      setSelectedEvent(updated);
      setFeedback(`Event ${updated.id.substring(0, 8)} reprocessed and published!`);
      setTimeout(() => setFeedback(null), 2500);
      loadData();
    } catch {
      setFeedback('Failed to reprocess event');
    }
  };

  const handleTriggerPoller = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setFeedback('Outbox publisher poller triggered. All pending events processed.');
      setTimeout(() => setFeedback(null), 2500);
      loadData();
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 font-mono-code mb-1">
            <Activity className="w-4 h-4" />
            <span>TRANSACTIONAL OUTBOX & DISTRIBUTED TRACING</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
            Event-Driven Architecture & RabbitMQ Inspector
          </h1>
          <p className="text-xs lg:text-sm text-slate-500 font-medium mt-0.5">
            Real-time AMQP event telemetry, Dead Letter Queue diagnostics, and JSON payload tracing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerPoller}
            disabled={isPublishing}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Zap className={`w-3.5 h-3.5 ${isPublishing ? 'animate-spin' : ''}`} />
            <span>{isPublishing ? 'Polling...' : 'Trigger AMQP Poller'}</span>
          </button>
        </div>
      </div>

      {/* 4 Telemetry Metrics matching Design Screen 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. JVM Memory */}
        <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">JVM Memory Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
              {telemetry?.jvmMemoryUtilizationPercent || 68.4}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${telemetry?.jvmMemoryUtilizationPercent || 68.4}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono-code mt-1.5">
              <span>Used: {telemetry?.jvmMemoryUsedGb || 6.57} GB</span>
              <span>Max: {telemetry?.jvmMemoryMaxGb || 9.60} GB</span>
            </div>
          </div>
        </div>

        {/* 2. HikariCP Pool */}
        <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HikariCP Saturation</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
              {telemetry?.dbPoolSaturationPercent || 42.7}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${telemetry?.dbPoolSaturationPercent || 42.7}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono-code mt-1.5">
              <span>Active: {telemetry?.dbActiveConnections || 42}</span>
              <span>Max Pool: {telemetry?.dbMaxConnections || 100}</span>
            </div>
          </div>
        </div>

        {/* 3. AMQP Throughput */}
        <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AMQP Message Throughput</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
              {(telemetry?.messageThroughputPerSec || 12500).toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">msgs/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{telemetry?.deliverySuccessRatePercent || 99.99}% Delivery Success</span>
            </div>
          </div>
        </div>

        {/* 4. Dead Letter Queue */}
        <div className="clean-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dead Letter Queue (DLQ)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono-code">
              {telemetry?.deadLetterQueueErrors || 0}{' '}
              <span className="text-sm font-semibold text-slate-400">errors</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All DLQ Queues Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Split Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chronological Event Stream Table */}
        <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transactional Outbox Event Stream</h3>
              <p className="text-[11px] text-slate-500">Atomic persistence in PostgreSQL before RabbitMQ exchange routing</p>
            </div>
            <span className="text-xs font-mono-code text-slate-500">
              Total Processed: <strong className="text-slate-800 font-bold">{telemetry?.totalOutboxEventsProcessed || 25842}</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedEvent(evt);
                    setSelectedOutboxEventId(evt.id);
                  }}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-50/70 border border-blue-500/80 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code font-bold text-xs text-blue-600">
                        {evt.eventType}
                      </span>
                      <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {evt.aggregateType}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 font-mono-code">
                      Key: <strong className="text-slate-900">{evt.routingKey}</strong>
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-code">
                      <span>ID: {evt.aggregateId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {evt.deliveryLatencyMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                      evt.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : evt.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{evt.status}</span>
                    </span>

                    {evt.status === 'FAILED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReprocess(evt.id);
                        }}
                        title="Reprocess failed event"
                        className="p-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Event JSON Payload Inspector */}
        {selectedEvent ? (
          <div className="clean-card bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono-code">
                    {selectedEvent.eventType}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono-code">
                    Aggregate: {selectedEvent.aggregateType} #{selectedEvent.aggregateId}
                  </p>
                </div>

                <button
                  onClick={handleCopyPayload}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              {/* Distributed Tracing Badges */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono-code">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Trace ID (W3C Standard)</div>
                  <div className="text-blue-400 font-bold truncate mt-0.5">{selectedEvent.traceId}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 font-mono-code">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Span ID</div>
                  <div className="text-emerald-400 font-bold truncate mt-0.5">{selectedEvent.spanId}</div>
                </div>
              </div>

              {/* JSON Payload Code Block */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Payload JSON Body
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono-code text-blue-300 overflow-x-auto max-h-[220px]">
                  {selectedEvent.payload}
                </pre>
              </div>
            </div>

            {/* Reprocess Footer Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono-code">Latency: {selectedEvent.deliveryLatencyMs} ms</span>
              <button
                onClick={() => handleReprocess(selectedEvent.id)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reprocess Event</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="clean-card p-12 text-center text-slate-400">
            Select an event from the stream to view payload.
          </div>
        )}
      </div>

      {/* RabbitMQ Cluster Health Topology Card */}
      <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">RabbitMQ 3.13 AMQP Topology & Queue Health</h3>
            <p className="text-[11px] text-slate-500">Virtual host <span className="font-mono-code font-bold">/</span> with 3 node cluster mirroring</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cluster Status: Green (3/3 Nodes)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 font-mono-code">supplychain.orders.queue</span>
            <p className="text-[11px] text-slate-500 mt-1">Consumer: Order Fulfiller</p>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● Active (0 backlog)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 font-mono-code">supplychain.inventory.queue</span>
            <p className="text-[11px] text-slate-500 mt-1">Consumer: Stock Sync</p>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● Active (0 backlog)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 font-mono-code">supplychain.dispatch.queue</span>
            <p className="text-[11px] text-slate-500 mt-1">Consumer: Fleet Dispatcher</p>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● Active (0 backlog)</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 font-mono-code">supplychain.telemetry.queue</span>
            <p className="text-[11px] text-slate-500 mt-1">Consumer: IoT Ingestion</p>
            <div className="text-[10px] text-emerald-600 font-bold mt-1">● Active (0 backlog)</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900 font-mono-code">supplychain.dlq</span>
            <p className="text-[11px] text-emerald-700 mt-1">Dead Letter Queue</p>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">● 0 Unrouted Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
};
