import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { OutboxEvent } from '../../types/index.ts';
import { useSupplyChainStore } from '../../stores/useSupplyChainStore.ts';

interface OutboxStreamCardProps {
  events: OutboxEvent[];
}

export const OutboxStreamCard: React.FC<OutboxStreamCardProps> = ({ events }) => {
  const { setActiveTab, setSelectedOutboxEventId } = useSupplyChainStore();

  return (
    <div className="clean-card bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transactional Outbox Stream</h3>
              <p className="text-[11px] text-slate-500 font-medium">Atomic events published to RabbitMQ exchange</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('outbox')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-3 max-h-[300px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No outbox events recorded yet.
            </div>
          ) : (
            events.slice(0, 5).map((evt) => (
              <div 
                key={evt.id} 
                onClick={() => {
                  setSelectedOutboxEventId(evt.id);
                  setActiveTab('outbox');
                }}
                className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 px-2 rounded-lg transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code font-bold text-xs text-blue-600 group-hover:underline">
                      {evt.eventType}
                    </span>
                    <span className="text-[10px] font-mono-code text-slate-400">
                      key: {evt.routingKey}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700 font-mono-code">ID: {evt.aggregateId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono-code">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {evt.deliveryLatencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{evt.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
