import React, { useState } from 'react';
import { UniversityPortal } from './demo/UniversityPortal';
import { StateManagementDemo } from './demo/StateManagementDemo';
import { SidepanelApp } from './extension/sidepanel/SidepanelApp';

export const StandaloneApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'portal' | 'redux'>('redux');

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        <div className="flex bg-slate-900 border-b border-slate-800 p-2 gap-4">
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'redux' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
            onClick={() => setActiveTab('redux')}
          >
            Redux State Demo
          </button>
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'portal' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
            onClick={() => setActiveTab('portal')}
          >
            University Portal
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'redux' ? <StateManagementDemo /> : <UniversityPortal />}
        </div>
      </div>

      {/* Embedded JARVIS Side Panel Simulator (~380px) */}
      <div className="w-[380px] shrink-0 h-full bg-[#0A0D14] border-l border-cyan-500/20 shadow-2xl flex flex-col">
        <SidepanelApp />
      </div>
    </div>
  );
};
