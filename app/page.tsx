"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Layers, Calendar, ClipboardList, PlusCircle, Activity } from 'lucide-react';
import { useMessStore, calculateMeals } from './store/useMessStore';
import MealAdjuster from './components/MealAdjuster';
import Ledger from './components/Ledger';
import BottomDock from './components/BottomDock';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'meals' | 'post-payment' | 'ledger'>('meals');
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { roommates, dailyMeals, selectedDate, setSelectedDate, fetchData, isLoaded, addPayment } = useMessStore();

  useEffect(() => { 
    fetchData().then(() => {
      if(roommates.length > 0 && !selectedUser) {
        setSelectedUser(roommates[0].id);
      }
    }); 
  }, [isLoaded]);

  // Premium Apple Style Loading Canvas
  if (!isLoaded) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-slate-900/50 blur-3xl animate-pulse" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]"
        >
          <Activity className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase">Synchronizing Engine</p>
        </motion.div>
      </main>
    );
  }

  // Pure Functional Metrics Generation
  let totalMeals = 0;
  Object.values(dailyMeals).forEach(day => {
    roommates.forEach(r => { totalMeals += calculateMeals(day[r.id]); });
  });
  
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = selectedUser || (roommates[0]?.id);
    if (!targetUser || !amount || !note) return;
    
    setIsSubmitting(true);
    try {
      await addPayment(targetUser, Number(amount), note);
      setAmount('');
      setNote('');
      setSuccessMessage('Transaction synchronized successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert("Synchronization fault occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#080b11] text-white p-4 md:p-8 overflow-x-hidden font-sans antialiased pb-32 selection:bg-indigo-500/30">
      
      {/* Immersive Structural Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/0 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-gradient-to-tl from-blue-600/15 to-pink-600/0 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Apple Premium Header Identity Component */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-b border-white/[0.05] pb-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Core Ecosystem</span>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Mess Architecture
            </h1>
          </div>
          <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05]">
            <span className="text-xs font-semibold px-3 text-slate-400">Production Mode</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
          </div>
        </header>

        {/* Global Analytics Row (Glassmorphism Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Expenditures', value: `$${totalCost.toFixed(2)}`, icon: DollarSign, gradient: 'from-emerald-400 to-teal-500' },
            { label: 'Accumulated Meals', value: totalMeals, icon: Layers, gradient: 'from-indigo-400 to-purple-500' },
            { label: 'Current Meal Rate', value: `$${mealRate.toFixed(2)}`, icon: Activity, gradient: 'from-blue-400 to-indigo-500', highlight: true }
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-6 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all hover:border-white/[0.12] overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <card.icon className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">{card.label}</p>
                <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                  <card.icon className="w-4 h-4 text-slate-300" />
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Dynamic Canvas Routing */}
        <section className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'meals' && (
              <motion.div 
                key="meals"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex justify-center">
                  <div className="inline-flex flex-col items-center p-3 px-6 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.06] shadow-inner">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> System Timeline
                    </label>
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)} 
                      className="bg-transparent text-lg font-bold text-white outline-none cursor-pointer [color-scheme:dark]" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {roommates.map(roommate => (
                    <MealAdjuster key={roommate.id} {...roommate} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'post-payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-2xl mx-auto w-full"
              >
                <form onSubmit={handlePostPayment} className="relative p-8 md:p-10 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col gap-6 overflow-hidden">
                  
                  <AnimatePresence>
                    {successMessage && (
                      <motion.div 
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center py-3 text-xs font-bold tracking-wider uppercase shadow-lg"
                      >
                        {successMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <PlusCircle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Post Capital Ledger</h2>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Entity (Member)</label>
                    <select 
                      value={selectedUser} 
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="bg-slate-900/60 border border-white/[0.08] rounded-xl p-4 text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-inner"
                    >
                      {roommates.map(r => <option key={r.id} value={r.id} className="bg-[#121824]">{r.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Financial Quantities ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-900/60 border border-white/[0.08] rounded-xl p-4 text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Specifications</label>
                    <textarea 
                      placeholder="Describe items purchased (e.g. Utility Bills, Shared Provisions...)" 
                      rows={3} 
                      value={note} 
                      onChange={(e) => setNote(e.target.value)}
                      className="bg-slate-900/60 border border-white/[0.08] rounded-xl p-4 text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-600"
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={isSubmitting}
                    className="mt-2 relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg transition-all disabled:opacity-40 text-sm tracking-wider uppercase"
                  >
                    {isSubmitting ? 'Synchronizing Execution...' : 'Commit Transaction'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {activeTab === 'ledger' && (
              <motion.div key="ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Ledger />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
      
      {/* Global Apple-Style Dock Nav */}
      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}