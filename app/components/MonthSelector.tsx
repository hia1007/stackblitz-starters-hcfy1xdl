"use client";
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string; // Format: "YYYY-MM"
  onChange: (newMonth: string) => void;
}

export default function MonthSelector({ selectedMonth, onChange }: MonthSelectorProps) {
  // Parse the "YYYY-MM" string into a date object safely
  const [year, month] = selectedMonth.split('-').map(Number);
  const currentDate = new Date(year, month - 1);

  const handlePrev = () => {
    const prevDate = new Date(year, month - 2);
    onChange(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNext = () => {
    const nextDate = new Date(year, month);
    onChange(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleReset = () => {
    const now = new Date();
    onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="p-4 md:p-6 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 rounded-xl">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-800 tracking-tight">Billing Month</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Independent Cycle</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200">
        <button 
          onClick={handlePrev} 
          className="p-2 hover:bg-white rounded-full transition-all active:scale-95 text-slate-600 hover:text-slate-900 shadow-sm hover:shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm font-black text-slate-800 min-w-[130px] text-center select-none">
          {monthName}
        </span>
        
        <button 
          onClick={handleNext} 
          className="p-2 hover:bg-white rounded-full transition-all active:scale-95 text-slate-600 hover:text-slate-900 shadow-sm hover:shadow"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!isCurrentMonth && (
        <button 
          onClick={handleReset}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
        >
          Back to Current
        </button>
      )}
    </div>
  );
}