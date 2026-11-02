import React from 'react';
import { ShieldCheck, Cpu, Zap, Eye } from 'lucide-react';
import { GlobalJarvisState } from '../../types';

interface HeaderProps {
  state: GlobalJarvisState;
}

export const Header: React.FC<HeaderProps> = ({ state }) => {
  return (
    <header className="bg-jarvis-card border-b border-jarvis-border p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4 animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm tracking-wider text-white">JARVIS</span>
              <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded">v1.0</span>
            </div>
            <p className="text-[10px] text-jarvis-muted font-mono">ON-DEVICE AI BROWSER AGENT</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
          </div>
          <span className="text-[9px] font-mono text-jarvis-muted mt-0.5">ZERO-CLOUD AI</span>
        </div>
      </div>

      {/* Badges strip */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
        <div className="flex items-center gap-1 bg-jarvis-bg/80 border border-jarvis-border px-1.5 py-1 rounded text-cyan-400">
          <Cpu className="w-3 h-3 shrink-0" />
          <span className="truncate">WEBGPU ACTIVE</span>
        </div>
        <div className="flex items-center gap-1 bg-jarvis-bg/80 border border-jarvis-border px-1.5 py-1 rounded text-emerald-400">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span className="truncate">PRIVACY 100%</span>
        </div>
        <div className="flex items-center gap-1 bg-jarvis-bg/80 border border-jarvis-border px-1.5 py-1 rounded text-purple-400">
          <Zap className="w-3 h-3 shrink-0" />
          <span className="truncate">LOCAL ML</span>
        </div>
      </div>
    </header>
  );
};
