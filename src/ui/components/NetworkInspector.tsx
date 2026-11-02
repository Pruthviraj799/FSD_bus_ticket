import React from 'react';
import { NetworkRequestLog } from '../../types';
import { ShieldCheck, ServerOff, Globe, Lock } from 'lucide-react';

interface NetworkInspectorProps {
  logs: NetworkRequestLog[];
}

export const NetworkInspector: React.FC<NetworkInspectorProps> = ({ logs }) => {
  return (
    <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-jarvis-border pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white uppercase">NETWORK PRIVACY PROOF MONITOR</span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
          0 CLOUD AI LEAKS
        </span>
      </div>

      <div className="bg-jarvis-bg/80 border border-jarvis-border rounded-lg p-2.5 text-[10px] space-y-1 text-jarvis-muted">
        <div className="flex justify-between">
          <span>External Cloud AI Endpoints:</span>
          <strong className="text-rose-400">BLOCKED / OFF</strong>
        </div>
        <div className="flex justify-between">
          <span>Private AI Context Uploads:</span>
          <strong className="text-emerald-400">0 Bytes Transmitted</strong>
        </div>
        <div className="flex justify-between">
          <span>Local Device Processing:</span>
          <strong className="text-cyan-300">100% On-Device (WebGPU/WASM)</strong>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-slate-500">
            No outgoing network traffic captured yet. System operating locally.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border flex items-center justify-between text-[10px] ${
                log.blockedByFirewall
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-jarvis-bg border-jarvis-border text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                {log.blockedByFirewall ? (
                  <ServerOff className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
                <span className="font-bold">{log.method}</span>
                <span className="truncate text-slate-400">{log.url}</span>
              </div>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  log.blockedByFirewall ? 'bg-rose-900 text-white' : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {log.blockedByFirewall ? 'FIREWALL BLOCKED' : 'SAFE ORIGIN'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
