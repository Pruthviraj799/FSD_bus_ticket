import React from 'react';
import { Shield, ShieldAlert, Lock, ServerOff } from 'lucide-react';
import { PrivacyState, SecurityState } from '../../types';

interface ShieldStatusProps {
  privacy: PrivacyState;
  security: SecurityState;
}

export const ShieldStatus: React.FC<ShieldStatusProps> = ({ privacy, security }) => {
  return (
    <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {security.status === 'PROTECTED' || security.status === 'VERIFIED' ? (
            <Shield className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <h4 className="text-xs font-bold font-mono text-white">PRIVACY FIREWALL</h4>
            <p className="text-[10px] text-jarvis-muted">Fail-Closed Local Sanitization</p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
          <Lock className="w-3 h-3" /> ACTIVE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-jarvis-border/60 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-jarvis-muted">
          <ServerOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Cloud AI: <strong className="text-white">OFF (0 Uploads)</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-jarvis-muted">
          <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>PII Redacted: <strong className="text-cyan-300">{privacy.redactedItemsCount} items</strong></span>
        </div>
      </div>
    </div>
  );
};
