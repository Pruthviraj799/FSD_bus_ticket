import React from 'react';
import { PrivacyState } from '../../types';
import { NetworkInspector } from '../components/NetworkInspector';
import { ShieldCheck, Lock, EyeOff, ServerOff } from 'lucide-react';

interface PrivacyViewProps {
  privacy: PrivacyState;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ privacy }) => {
  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="bg-jarvis-card border border-jarvis-border p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">ZERO-CLOUD PRIVACY FIREWALL</h3>
            <p className="text-[10px] text-jarvis-muted">Fail-Closed On-Device Data Sanitizer</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
          <Lock className="w-3 h-3" /> FAIL-CLOSED
        </div>
      </div>

      {/* PII Detection Log */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-jarvis-border pb-2">
          <EyeOff className="w-4 h-4 text-cyan-400" /> DETECTED PII & LOCAL REDACTION LOG
        </h4>

        {privacy.detectedPIIList.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-slate-500">
            No active PII leakage risk detected. Page sanitized.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {privacy.detectedPIIList.map((pii) => (
              <div key={pii.id} className="bg-jarvis-bg border border-jarvis-border p-2 rounded text-[10px] space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-rose-400">{pii.type} DETECTED</span>
                  <span className="text-emerald-400">REDACTED LOCALLY</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[9px]">
                  <span className="line-through text-slate-500">{pii.originalSnippet}</span>
                  <span className="text-cyan-300 font-bold">→ {pii.redactedMask}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Privacy Proof */}
      <NetworkInspector logs={privacy.networkLogs} />
    </div>
  );
};
