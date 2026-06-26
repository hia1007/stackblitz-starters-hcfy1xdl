"use client";
import MealAdjuster from './components/MealAdjuster';
import Ledger from './components/Ledger';
import { useMessStore } from './store/useMessStore';

export default function Dashboard() {
  const roommates = useMessStore(state => state.roommates);

  // Live End-of-Month Calculations
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const totalMeals = roommates.reduce((sum, r) => sum + r.meals, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="text-center space-y-2 pt-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Bachelor Mess Tracker</h1>
        <p className="text-slate-700 font-semibold">Real-time meal and expense synchronization.</p>
      </header>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Cost</p>
          <p className="text-4xl font-black text-slate-800">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Meals</p>
          <p className="text-4xl font-black text-slate-800">{totalMeals}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Current Meal Rate</p>
          <p className="text-4xl font-black text-blue-600">${mealRate.toFixed(2)}</p>
        </div>
      </div>

      {/* 7 Roommate Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roommates.map(roommate => (
          <MealAdjuster key={roommate.id} {...roommate} />
        ))}
      </div>

      {/* Final Settlement Ledger */}
      <Ledger />
    </main>
  );
}