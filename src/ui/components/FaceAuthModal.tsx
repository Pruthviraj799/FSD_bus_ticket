import React, { useState } from 'react';
import { PlanStep } from '../../types';
import { CameraPreview } from './CameraPreview';
import { ShieldAlert, Lock, CheckCircle2, X } from 'lucide-react';

interface FaceAuthModalProps {
  step: PlanStep;
  onConfirm: () => void;
  onCancel: () => void;
}

export const FaceAuthModal: React.FC<FaceAuthModalProps> = ({ step, onConfirm, onCancel }) => {
  const [faceVerified, setFaceVerified] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-jarvis-card border border-rose-500/40 rounded-xl max-w-sm w-full p-4 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-jarvis-border pb-2">
          <div className="flex items-center gap-2 text-rose-400">
            <Lock className="w-5 h-5" />
            <h3 className="text-xs font-mono font-bold uppercase text-white">HIGH RISK ACTION GATEWAY</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-xs space-y-1 font-mono">
          <div className="flex justify-between font-bold text-rose-300">
            <span>ACTION: {step.action.toUpperCase()}</span>
            <span className="bg-rose-900/60 px-1.5 py-0.2 rounded text-[10px]">RISK: CRITICAL</span>
          </div>
          <p className="text-slate-300">{step.description}</p>
          <p className="text-[10px] text-jarvis-muted">{step.reason}</p>
        </div>

        {/* Camera Face Verification Widget */}
        <CameraPreview onAuthenticated={(success) => setFaceVerified(success)} />

        <div className="flex gap-2 pt-2 border-t border-jarvis-border">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs py-2 rounded-lg transition"
          >
            Cancel Action
          </button>
          <button
            onClick={onConfirm}
            disabled={!faceVerified}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm & Execute
          </button>
        </div>
      </div>
    </div>
  );
};
