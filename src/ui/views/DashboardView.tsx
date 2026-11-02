import React from 'react';
import { GlobalJarvisState } from '../../types';
import { ShieldStatus } from '../components/ShieldStatus';
import { PlanVisualizer } from '../components/PlanVisualizer';
import { Play, Sparkles, AlertCircle, ScanEye, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  state: GlobalJarvisState;
  onRunPrompt: (prompt: string) => void;
  onScanPage: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ state, onRunPrompt, onScanPage }) => {
  return (
    <div className="p-3 space-y-3">
      {/* Current Page Banner */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-jarvis-muted flex items-center gap-1">
            <ScanEye className="w-3.5 h-3.5 text-cyan-400" /> ACTIVE WEBPAGE
          </span>
          <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded text-[10px] font-bold">
            TIER: {state.perception.tier}
          </span>
        </div>

        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-white truncate">{state.perception.pageTitle}</h3>
          <p className="text-[10px] text-slate-400 font-mono truncate">{state.perception.url}</p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-jarvis-border">
          <span className="text-slate-400">
            Detected Elements: <strong className="text-white">{state.perception.totalElements}</strong>
          </span>
          <span className="text-slate-400">
            PII Fields: <strong className="text-rose-400">{state.perception.sensitiveElementsCount}</strong>
          </span>
          <button
            onClick={onScanPage}
            className="bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded transition"
          >
            Re-Perceive Page
          </button>
        </div>
      </div>

      {/* Shield & Firewall Overview */}
      <ShieldStatus privacy={state.privacy} security={state.security} />

      {/* Quick Scenario Launch Buttons */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2 font-mono">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>QUICK DEMO SCENARIOS</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5 text-xs">
          <button
            onClick={() => onRunPrompt('Fill my profile.')}
            className="w-full bg-jarvis-bg hover:bg-slate-800 border border-jarvis-border p-2 rounded text-left transition flex items-center justify-between text-slate-200 group"
          >
            <div>
              <span className="font-bold text-cyan-300 block text-[11px]">1. "Fill my profile."</span>
              <span className="text-[10px] text-slate-400">Perceive → classify PII → safe fill → verify</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onRunPrompt('Search for AI scholarships.')}
            className="w-full bg-jarvis-bg hover:bg-slate-800 border border-jarvis-border p-2 rounded text-left transition flex items-center justify-between text-slate-200 group"
          >
            <div>
              <span className="font-bold text-cyan-300 block text-[11px]">2. "Search for AI scholarships."</span>
              <span className="text-[10px] text-slate-400">Locate field → type → click search → verify</span>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => onRunPrompt('Submit the application.')}
            className="w-full bg-jarvis-bg hover:bg-slate-800 border border-jarvis-border p-2 rounded text-left transition flex items-center justify-between text-slate-200 group"
          >
            <div>
              <span className="font-bold text-rose-300 block text-[11px]">3. "Submit application." (High Risk)</span>
              <span className="text-[10px] text-slate-400">Triggers Face Auth + explicit user confirmation</span>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </div>

      {/* Plan Visualizer */}
      <PlanVisualizer plan={state.agent.plan} status={state.agent.status} />
    </div>
  );
};
