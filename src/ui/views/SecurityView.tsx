import React from 'react';
import { SecurityState } from '../../types';
import { CameraPreview } from '../components/CameraPreview';
import { ShieldCheck, UserCheck, Lock, Unlock, Key, AlertTriangle } from 'lucide-react';

interface SecurityViewProps {
  security: SecurityState;
  onToggleLock: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ security, onToggleLock }) => {
  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="bg-jarvis-card border border-jarvis-border p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">SECURITY & RISK ENGINE</h3>
            <p className="text-[10px] text-jarvis-muted">Risk-Gated Biometric Authorization</p>
          </div>
        </div>
        <button
          onClick={onToggleLock}
          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition flex items-center gap-1 ${
            security.userPresent
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
          }`}
        >
          {security.userPresent ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {security.userPresent ? 'UNLOCKED' : 'SYSTEM LOCKED'}
        </button>
      </div>

      {/* Face Auth Camera Scanner */}
      <CameraPreview />

      {/* Risk Engine Rules Summary */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-jarvis-border pb-2">
          <Key className="w-4 h-4 text-cyan-400" /> RISK LEVEL AUTHORIZATION TIERS
        </h4>

        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
            <span className="text-slate-300 font-bold">LOW RISK (Read, Search, Scroll)</span>
            <span className="text-emerald-400 font-bold">AUTOMATIC</span>
          </div>
          <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
            <span className="text-slate-300 font-bold">MEDIUM RISK (Profile Fill)</span>
            <span className="text-cyan-400 font-bold">LOCAL CONFIRMATION</span>
          </div>
          <div className="flex justify-between p-1.5 bg-jarvis-bg rounded border border-jarvis-border">
            <span className="text-slate-300 font-bold">HIGH / CRITICAL (Submissions)</span>
            <span className="text-rose-400 font-bold">FACE AUTH + CONFIRM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
