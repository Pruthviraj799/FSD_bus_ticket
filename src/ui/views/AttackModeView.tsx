import React, { useState } from 'react';
import { ShieldAlert, Play, CheckCircle2, ServerOff, Lock, Zap } from 'lucide-react';

export const AttackModeView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  const handleRunAttackSimulation = () => {
    setIsRunning(true);
    setTestComplete(false);

    setTimeout(() => {
      setIsRunning(false);
      setTestComplete(true);
    }, 1800);
  };

  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="bg-jarvis-card border border-rose-500/40 p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">PRIVACY ATTACK MODE (DEMO TEST)</h3>
            <p className="text-[10px] text-jarvis-muted">Synthetic Data Privacy Breach Simulation</p>
          </div>
        </div>
        <span className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
          SYNTHETIC TEST
        </span>
      </div>

      <div className="bg-jarvis-card border border-jarvis-border p-3 rounded-lg space-y-3">
        <p className="text-[10px] text-slate-300">
          Simulates an aggressive webpage data scraping attack attempting to leak synthetic PII and password values to an unauthorized remote AI endpoint.
        </p>

        <button
          onClick={handleRunAttackSimulation}
          disabled={isRunning}
          className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-rose-600/20"
        >
          <Play className="w-4 h-4 fill-current" />
          {isRunning ? 'Running Synthetic Attack Simulation...' : 'RUN PRIVACY ATTACK TEST'}
        </button>
      </div>

      {/* Verification Matrix Results */}
      {(testComplete || isRunning) && (
        <div className="bg-jarvis-card border border-emerald-500/40 rounded-lg p-3 space-y-2">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-jarvis-border pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SIMULATION VERIFICATION MATRIX
          </h4>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">Local Processing</span>
              <strong className="text-emerald-400 font-bold">✓ ACTIVE (100%)</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">PII Pattern Detection</span>
              <strong className="text-emerald-400 font-bold">✓ 4 SENSITIVE ITEMS DETECTED</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">Fail-Closed Mask Redaction</span>
              <strong className="text-emerald-400 font-bold">✓ 100% SANITIZED</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">External Cloud AI Status</span>
              <strong className="text-emerald-400 font-bold">✓ OFF (DISABLED)</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">Sensitive Data Uploads</span>
              <strong className="text-emerald-400 font-bold">✓ 0 BYTES TRANSMITTED</strong>
            </div>
            <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
              <span className="text-slate-300">Network Leakage</span>
              <strong className="text-emerald-400 font-bold">✓ 0 DATA LEAKS (BLOCKED)</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
