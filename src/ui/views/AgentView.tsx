import React, { useState } from 'react';
import { AgentState } from '../../types';
import { PlanVisualizer } from '../components/PlanVisualizer';
import { Bot, Send, ShieldAlert, Play, Terminal, FastForward } from 'lucide-react';

interface AgentViewProps {
  agent: AgentState;
  onRunPrompt: (prompt: string) => void;
  onExecuteNextStep: () => void;
  onAutoRunPlan: () => void;
}

export const AgentView: React.FC<AgentViewProps> = ({ agent, onRunPrompt, onExecuteNextStep, onAutoRunPlan }) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    onRunPrompt(inputPrompt);
  };

  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="bg-jarvis-card border border-jarvis-border p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">JARVIS AI AGENT</h3>
            <p className="text-[10px] text-jarvis-muted">Observe → Plan → Act → Verify Loop</p>
          </div>
        </div>
        <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold">
          STATUS: {agent.status}
        </span>
      </div>

      {/* Prompt Injection Threat Alert */}
      {agent.promptInjectionDetected && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-lg text-rose-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
            <ShieldAlert className="w-4 h-4" /> PROMPT INJECTION THREAT INTERCEPTED
          </div>
          <p className="text-[10px]">
            Webpage contains untrusted malicious instructions attempting to alter agent behavior. Disregarded.
          </p>
        </div>
      )}

      {/* Prompt Entry Form */}
      <form onSubmit={handleSubmit} className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <label className="block text-slate-300 text-xs font-bold">USER INTENT COMMAND</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Fill my profile / Search AI internships / Submit..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 bg-jarvis-bg border border-jarvis-border rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded transition flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" /> Plan
          </button>
        </div>
      </form>

      {/* Action Plan Visualizer */}
      <PlanVisualizer
        plan={agent.plan}
        status={agent.status}
        onExecuteNext={onExecuteNextStep}
        onAutoRun={onAutoRunPlan}
      />

      {/* Reasoning & Verification Logs */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-jarvis-border pb-2">
          <Terminal className="w-4 h-4 text-cyan-400" /> REASONING & VERIFICATION LOGS
        </h4>
        <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1 text-[10px] text-slate-400">
          {agent.activityLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-cyan-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
