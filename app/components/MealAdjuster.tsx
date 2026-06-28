"use client";
import { useMessStore, defaultMeals } from '../store/useMessStore';

interface MealAdjusterProps {
  id: string;
  name: string;
  spent: number;
}

export default function MealAdjuster({ id, name, spent }: MealAdjusterProps) {
  const { dailyMeals, selectedDate, toggleMeal } = useMessStore();
  
  const currentMeals = dailyMeals[selectedDate]?.[id] || { ...defaultMeals };
  
  // Calculate if the currently selected date is in the past
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < today;

  const handleToggle = (key: 'noon' | 'night' | 'hasGuest' | 'guestNoon' | 'guestNight') => {
    // If it is a past date, force a confirmation popup
    if (isPastDate) {
      const confirmed = window.confirm(
        "Are you sure you want to edit a previous day's meal record? This action will permanently mark this entry as 'Edited' for transparency."
      );
      if (!confirmed) return; // Stop if they hit cancel
    }
    
    toggleMeal(id, key, isPastDate);
  };

  const options = [
    { key: 'noon' as const, label: 'Lunch' },
    { key: 'night' as const, label: 'Dinner' },
    { key: 'hasGuest' as const, label: '+ Guest' }
  ];

  return (
    <div className="p-5 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 duration-300 flex flex-col gap-4">
      
      <div className="flex justify-between items-start border-b border-slate-200 pb-3">
        <div className="flex flex-col items-start gap-1">
          <h3 className="font-black text-slate-800 text-lg leading-none">{name}</h3>
          
          {/* Renders an "Edited" badge if this day was tampered with */}
          {currentMeals.is_edited && (
            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
              Edited
            </span>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            ৳{spent.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const checked = currentMeals[opt.key];
          return (
            <label 
              key={opt.key}
              className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer select-none transition-all active:scale-95 ${
                checked 
                  ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm' 
                  : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white'
              }`}
            >
              <span className="text-sm font-bold">{opt.label}</span>
              <input 
                type="checkbox" 
                checked={checked}
                onChange={() => handleToggle(opt.key)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
              }`}>
                {checked && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
            </label>
          );
        })}

        {/* Guest Options Slide-Down */}
        {currentMeals.hasGuest && (
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { key: 'guestNoon' as const, label: 'Guest Lunch' },
              { key: 'guestNight' as const, label: 'Guest Dinner' }
            ].map((gOpt) => (
              <label 
                key={gOpt.key} 
                className={`flex items-center justify-between p-2.5 px-3 rounded-xl border-2 cursor-pointer transition-all active:scale-95 ${
                  currentMeals[gOpt.key]
                    ? 'bg-pink-50 border-pink-200 text-pink-900'
                    : 'bg-white/50 border-slate-100 text-slate-500 hover:bg-white'
                }`}
              >
                <span className="text-xs font-bold">{gOpt.label}</span>
                <input 
                  type="checkbox" 
                  checked={currentMeals[gOpt.key]} 
                  onChange={() => handleToggle(gOpt.key)} 
                  className="sr-only" 
                />
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                  currentMeals[gOpt.key] ? 'bg-pink-600 border-pink-600' : 'border-slate-300'
                }`}>
                  {currentMeals[gOpt.key] && <div className="w-1.5 h-1.5 bg-white rounded-[2px]" />}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}