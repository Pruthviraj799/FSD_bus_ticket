import React from 'react';
import { PlanStep, AgentStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, Play, RotateCcw, FastForward } from 'lucide-react';

interface PlanVisualizerProps {
  plan: PlanStep[];
  status: AgentStatus;
  onExecuteNext?: () => void;
  onAutoRun?: () => void;
}

export const PlanVisualizer: React.FC<PlanVisualizerProps> = ({ plan, status, onExecuteNext, onAutoRun }) => {
  if (plan.length === 0) {
    return (
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-4 text-center space-y-2 font-mono">
        <Clock className="w-6 h-6 text-jarvis-muted mx-auto" />
        <p className="text-xs text-jarvis-muted font-bold">No active action plan generated yet.</p>
        <p className="text-[10px] text-slate-500">Enter a prompt or select a quick scenario above.</p>
      </div>
    );
  }

  const completedCount = plan.filter((s) => s.status === 'COMPLETED' || s.status === 'VERIFIED').length;
  const isFinished = completedCount === plan.length;

  return (
    <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-jarvis-border pb-2">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase">ACTION PLAN EXECUTION ({completedCount}/{plan.length})</h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          status === 'ACTING' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse' :
          status === 'VERIFYING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
          status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {status}
        </span>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {plan.map((step) => {
          const isDone = step.status === 'COMPLETED' || step.status === 'VERIFIED';
          const isInProgress = step.status === 'IN_PROGRESS';
          const isFailed = step.status === 'FAILED';

          return (
            <div
              key={step.id}
              className={`p-2 rounded border text-xs transition ${
                isInProgress ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10' :
                isDone ? 'bg-jarvis-bg/60 border-jarvis-border text-slate-300' :
                isFailed ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' :
                'bg-jarvis-bg/30 border-jarvis-border/40 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 truncate">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isInProgress ? (
                    <RotateCcw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className="font-bold truncate">
                    Step {step.stepNumber}: {step.description}
                  </span>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 ${
                    step.risk === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800 font-bold' :
                    step.risk === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800 font-bold' :
                    'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.risk}
                </span>
              </div>

              <div className="text-[10px] text-jarvis-muted pl-6 flex justify-between">
                <span className="truncate">Reason: {step.reason}</span>
                {step.verificationReason && (
                  <span className="text-emerald-400 font-bold shrink-0 ml-2">{step.verificationReason}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isFinished && (
        <div className="flex gap-2 pt-1 border-t border-jarvis-border">
          {onExecuteNext && (
            <button
              onClick={onExecuteNext}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-1.5 rounded transition flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Next Step
            </button>
          )}
          {onAutoRun && (
            <button
              onClick={onAutoRun}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-1.5 rounded transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20"
            >
              <FastForward className="w-3.5 h-3.5 fill-current" /> Auto-Run Plan
            </button>
          )}
        </div>
      )}
    </div>
  );
};
