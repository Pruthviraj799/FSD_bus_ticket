import React from 'react';
import { PerceptionState } from '../../types';
import { Scan, Eye, Layers, ShieldAlert, Cpu } from 'lucide-react';

interface PerceptionViewProps {
  perception: PerceptionState;
  onRefresh: () => void;
}

export const PerceptionView: React.FC<PerceptionViewProps> = ({ perception, onRefresh }) => {
  return (
    <div className="p-3 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between bg-jarvis-card border border-jarvis-border p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="font-bold text-white uppercase text-xs">ADAPTIVE PERCEPTION ENGINE</h3>
            <p className="text-[10px] text-jarvis-muted">Tiered Page Understanding (DOM → OCR → Vision)</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded text-[10px] transition flex items-center gap-1"
        >
          <Scan className="w-3 h-3" /> Scan Page
        </button>
      </div>

      {/* Perception Tier & Metrics */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-jarvis-card border border-jarvis-border p-2 rounded text-center">
          <span className="text-jarvis-muted block">PIPELINE TIER</span>
          <strong className="text-cyan-400 text-xs font-bold">{perception.tier}</strong>
        </div>
        <div className="bg-jarvis-card border border-jarvis-border p-2 rounded text-center">
          <span className="text-jarvis-muted block">TOTAL ELEMENTS</span>
          <strong className="text-white text-xs font-bold">{perception.totalElements}</strong>
        </div>
        <div className="bg-jarvis-card border border-jarvis-border p-2 rounded text-center">
          <span className="text-jarvis-muted block">CONFIDENCE</span>
          <strong className="text-emerald-400 text-xs font-bold">{(perception.confidenceScore * 100).toFixed(0)}%</strong>
        </div>
      </div>

      {/* Element List */}
      <div className="bg-jarvis-card border border-jarvis-border rounded-lg p-3 space-y-2">
        <h4 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-jarvis-border pb-2">
          <Eye className="w-4 h-4 text-cyan-400" /> DETECTED STRUCTURED ELEMENTS
        </h4>

        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {perception.elements.map((elem) => (
            <div key={elem.element_id} className="bg-jarvis-bg border border-jarvis-border p-2 rounded text-[10px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300">{elem.element_id} ({elem.type})</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    elem.sensitivity !== 'PUBLIC' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {elem.sensitivity}
                </span>
              </div>
              <p className="text-slate-300 truncate">Text: "{elem.text || elem.field_name || 'N/A'}"</p>
              <div className="flex justify-between text-slate-500 text-[9px]">
                <span>BBox: [{elem.bbox.join(', ')}]</span>
                <span>Confidence: {(elem.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
