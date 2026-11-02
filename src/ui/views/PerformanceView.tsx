import React from 'react';
import { PerformanceMetrics } from '../../types';
import { Cpu, Zap, Activity, HardDrive } from 'lucide-react';

interface PerformanceViewProps {
  performance: PerformanceMetrics;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ performance }) => {
  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="bg-jarvis-card border border-jarvis-border p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">PERFORMANCE TELEMETRY</h3>
            <p className="text-[10px] text-jarvis-muted">Real-Time On-Device Resource Monitor</p>
          </div>
        </div>
        <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold">
          WEBGPU: {performance.webGpuAccelerated ? 'ENABLED' : 'WASM'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-jarvis-card border border-jarvis-border p-3 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> INFERENCE LATENCY
          </div>
          <p className="text-base font-bold text-white">{performance.inferenceLatencyMs} ms</p>
        </div>

        <div className="bg-jarvis-card border border-jarvis-border p-3 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> PERCEPTION TIME
          </div>
          <p className="text-base font-bold text-cyan-300">{performance.perceptionLatencyMs} ms</p>
        </div>

        <div className="bg-jarvis-card border border-jarvis-border p-3 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-purple-400" /> CLIENT RAM MEMORY
          </div>
          <p className="text-base font-bold text-purple-300">{performance.memoryUsageMb} MB</p>
        </div>

        <div className="bg-jarvis-card border border-jarvis-border p-3 rounded space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> MODEL SIZE
          </div>
          <p className="text-base font-bold text-emerald-300">{performance.activeModelSize}</p>
        </div>
      </div>

      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <h4 className="font-bold text-white text-xs border-b border-jarvis-border pb-2">LOCAL RUNTIME STACK</h4>
        <div className="space-y-1 text-[10px] text-slate-400">
          <div className="flex justify-between">
            <span>Perception Engine:</span>
            <span className="text-slate-200">DOM-First + Canvas Spatial Scorer</span>
          </div>
          <div className="flex justify-between">
            <span>Local Reasoning:</span>
            <span className="text-slate-200">On-Device Micro Planner (Transformers.js / WASM)</span>
          </div>
          <div className="flex justify-between">
            <span>Biometric Matching:</span>
            <span className="text-slate-200">Client Memory 64D Feature Vector Cosine Matcher</span>
          </div>
        </div>
      </div>
    </div>
  );
};
