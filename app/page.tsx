"use client";
import { useState } from 'react';
import MealAdjuster from './components/MealAdjuster';
import Ledger from './components/Ledger';
import { useMessStore, calculateMeals } from './store/useMessStore';

export default function Dashboard() {
  // This state controls which tab we are currently viewing
  const [activeTab, setActiveTab] = useState<'meals' | 'ledger'>('meals');
  
  const { roommates, dailyMeals, selectedDate, setSelectedDate } = useMessStore();

  let totalMeals = 0;
  Object.values(dailyMeals).forEach(day => {
    roommates.forEach(r => { totalMeals += calculateMeals(day[r.id]); });
  });
  
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      <header className="text-center space-y-6 pt-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Bachelor Mess Tracker</h1>
        
        {/* Apple-Style Segmented Control (Tabs) */}
        <div className="inline-flex bg-white/40 backdrop-blur-md p-1 rounded-2xl border border-white/60 shadow-inner">
          <button 
            onClick={() => setActiveTab('meals')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'meals' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Meals
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'ledger' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manager Ledger
          </button>
        </div>
      </header>

      {/* Global Metrics Row (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Month Cost</p>
          <p className="text-4xl font-black text-slate-800">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Meals Till Now</p>
          <p className="text-4xl font-black text-slate-800">{totalMeals}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Current Meal Rate</p>
          <p className="text-4xl font-black text-blue-600">${mealRate.toFixed(2)}</p>
        </div>
      </div>

      {/* CONDITIONAL RENDERING based on the Active Tab */}
      {activeTab === 'meals' ? (
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xl font-black text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roommates.map(roommate => (
              <MealAdjuster key={roommate.id} {...roommate} />
            ))}
          </div>
        </div>
      ) : (
        <Ledger />
      )}
      
    </main>
  );
}