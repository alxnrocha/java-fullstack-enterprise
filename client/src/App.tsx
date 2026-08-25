import { Layers, Radio, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center justify-center p-6">
      <div className="clean-card rounded-2xl p-8 max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Radio className="w-3.5 h-3.5 animate-pulse text-blue-600" />
            <span>Event-Driven Outbox • RabbitMQ Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            LogiSync Enterprise Core
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Intelligent Global Logistics Control Tower &amp; Multi-Tier Supply Chain ERP.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono-code">
          <span>React 19 + Java 21 LTS</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Bootstrap Online
          </span>
        </div>
      </div>
    </div>
  );
}
