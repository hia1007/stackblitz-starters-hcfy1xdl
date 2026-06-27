"use client";
import { motion } from 'framer-motion';
import { CalendarDays, PlusCircle, Landmark } from 'lucide-react';

interface BottomDockProps {
  activeTab: 'meals' | 'post-payment' | 'ledger';
  setActiveTab: (tab: 'meals' | 'post-payment' | 'ledger') => void;
}

export default function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  const tabs = [
    { id: 'meals', name: 'Meals', icon: CalendarDays },
    { id: 'post-payment', name: 'Expenses', icon: PlusCircle },
    { id: 'ledger', name: 'Ledger', icon: Landmark }
  ] as const;

  return (
    // Explicit pointer-events-auto forces the navigation bar to capture target interactions
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button" // Guarantees standard, predictable browser hit-box behaviors
              onClick={() => setActiveTab(tab.id)}
              className="group relative flex flex-col items-center justify-center p-3 px-6 rounded-xl text-xs font-semibold tracking-wide transition-all outline-none cursor-pointer select-none isolate"
              style={{ color: isActive ? '#fff' : '#94a3b8' }}
            >
              {/* Premium Sliding Structural Indicator (Moved to safe z-0 with pointer bypass) */}
              {isActive && (
                <motion.div
                  layoutId="dock-indicator"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.06] rounded-xl z-0 pointer-events-none"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Foreground Layout Elements (Explicitly raised to z-10) */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <Icon 
                  className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 group-active:scale-95 duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                <span>{tab.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}