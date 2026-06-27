'use client';

interface BottomDockProps {
  activeTab: 'meals' | 'post-payment' | 'ledger';
  setActiveTab: (tab: 'meals' | 'post-payment' | 'ledger') => void;
}

export default function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center max-w-md mx-auto p-2 pb-safe">
        
        {/* MEALS BUTTON */}
        <button 
          onClick={() => setActiveTab('meals')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-all duration-200 ${
            activeTab === 'meals' 
              ? 'text-blue-600 bg-blue-50 scale-105' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <span className="text-xl mb-1">📅</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Meals</span>
        </button>

        {/* PAY BUTTON */}
        <button 
          onClick={() => setActiveTab('post-payment')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-all duration-200 ${
            activeTab === 'post-payment' 
              ? 'text-blue-600 bg-blue-50 scale-105' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <span className="text-xl mb-1">💰</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Pay</span>
        </button>

        {/* LEDGER BUTTON */}
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center p-2 w-20 rounded-xl transition-all duration-200 ${
            activeTab === 'ledger' 
              ? 'text-blue-600 bg-blue-50 scale-105' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          <span className="text-xl mb-1">📊</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Ledger</span>
        </button>

      </div>
    </div>
  );
}