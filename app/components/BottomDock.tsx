"use client";
import { Edit3, Landmark } from 'lucide-react';

interface BottomDockProps {
  activeTab: 'ledger' | 'entries';
  setActiveTab: (tab: 'ledger' | 'entries') => void;
}

export default function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  const tabs = [
    { id: 'ledger', name: 'Ledger', icon: Landmark },
    { id: 'entries', name: 'Entries', icon: Edit3 }
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw] pointer-events-auto">
      <div className="flex items-center gap-2 p-2 rounded-3xl bg-slate-900/80 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-3 px-8 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 outline-none cursor-pointer select-none active:scale-95 ${
                isActive 
                  ? 'text-white bg-white/15 border border-white/10 shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}