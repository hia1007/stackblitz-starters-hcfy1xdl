"use client";
import { useState, useEffect } from 'react';
import MealAdjuster from './components/MealAdjuster';
import Ledger from './components/Ledger';
import { useMessStore, calculateMeals } from './store/useMessStore';
import BottomDock from './components/BottomDock';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'meals' | 'post-payment' | 'ledger'>('meals');
  
  // Post Payment Form State
  const [selectedUser, setSelectedUser] = useState('1');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { roommates, dailyMeals, selectedDate, setSelectedDate, fetchData, isLoaded, addPayment } = useMessStore();

  useEffect(() => { fetchData(); }, []);

  // Cleaned up loading screen
  if (!isLoaded) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-bold text-slate-500 animate-pulse">Loading Mess Tracker...</p>
      </main>
    );
  }

  let totalMeals = 0;
  Object.values(dailyMeals).forEach(day => {
    roommates.forEach(r => { totalMeals += calculateMeals(day[r.id]); });
  });
  
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !note) return alert("Please fill out both the amount and note.");
    
    setIsSubmitting(true);
    await addPayment(selectedUser, Number(amount), note);
    
    // Reset form and show success message
    setAmount('');
    setNote('');
    setIsSubmitting(false);
    setSuccessMessage('Payment successfully posted and saved!');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    // Added pb-24 so the Bottom Dock doesn't cover up your content at the bottom
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 pb-24 relative">
      
      <header className="text-center space-y-6 pt-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Bachelor Mess Tracker</h1>
        {/* The old top tabs were deleted from here */}
      </header>

      {/* Global Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Month Cost</p>
          <p className="text-4xl font-black text-slate-800">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Total Meals Logged</p>
          <p className="text-4xl font-black text-slate-800">{totalMeals}</p>
        </div>
        <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md text-center">
          <p className="text-sm font-bold text-slate-600 uppercase mb-1">Current Meal Rate</p>
          <p className="text-4xl font-black text-blue-600">${mealRate.toFixed(2)}</p>
        </div>
      </div>

      {/* CONDITIONAL ROUTING BASED ON TAB */}
      
      {/* 1. MEALS TAB */}
      {activeTab === 'meals' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <div className="inline-flex flex-col items-center p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-xl font-black text-slate-800 outline-none cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roommates.map(roommate => <MealAdjuster key={roommate.id} {...roommate} />)}
          </div>
        </div>
      )}

      {/* 2. POST PAYMENT TAB */}
      {activeTab === 'post-payment' && (
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handlePostPayment} className="p-6 md:p-10 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg flex flex-col gap-6 relative overflow-hidden">
            
            {successMessage && (
              <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-sm font-bold shadow-md animate-pulse">
                {successMessage}
              </div>
            )}

            <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Post New Payment</h2>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Name</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-white/60 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-sm"
              >
                {roommates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid ($)</label>
              <input 
                type="number" 
                placeholder="e.g., 50.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/60 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note / Purpose (What was bought?)</label>
              <textarea 
                placeholder="e.g., Rice, Chicken, Vegetables, Gas Bill..." 
                rows={3} 
                value={note} 
                onChange={(e) => setNote(e.target.value)}
                className="bg-white/60 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-lg"
            >
              {isSubmitting ? 'Processing...' : 'Submit Payment'}
            </button>
          </form>
        </div>
      )}

      {/* 3. MANAGER LEDGER TAB */}
      {activeTab === 'ledger' && <Ledger />}
      
      {/* Bottom Dock successfully added to the main render! */}
      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </main>
  );
}