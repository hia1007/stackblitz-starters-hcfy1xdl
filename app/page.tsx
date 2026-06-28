"use client";
import { useState, useEffect } from 'react';
import MealAdjuster from './components/MealAdjuster';
import { useMessStore, calculateMeals } from './store/useMessStore';
import BottomDock from './components/BottomDock';
import { MoreVertical, UserPlus, Trash2, X } from 'lucide-react';
// NEW: Imported the DESCO component
import DescoAnalytics from './components/DescoAnalytics'; 

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'entries'>('ledger');
  
  // Header Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  // Analytics State 
  const [selectedAnalyticsUser, setSelectedAnalyticsUser] = useState('');

  // Post Payment Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { roommates, dailyMeals, payments, selectedDate, setSelectedDate, fetchData, isLoaded, addPayment, addMember, deleteMember, deletePayment } = useMessStore();

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  useEffect(() => {
    if (roommates.length > 0) {
      if (selectedAnalyticsUser && !roommates.some(r => r.id === selectedAnalyticsUser)) {
        setSelectedAnalyticsUser('');
      }
      if (selectedUser && !roommates.some(r => r.id === selectedUser)) {
        setSelectedUser('');
      }
    }
  }, [roommates, selectedAnalyticsUser, selectedUser]);

  if (!isLoaded) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-bold text-slate-500 animate-pulse">Synchronizing Mess Engine...</p>
      </main>
    );
  }

  let totalMeals = 0;
  Object.values(dailyMeals).forEach(day => {
    roommates.forEach(r => { 
      if (day[r.id]) totalMeals += calculateMeals(day[r.id]); 
    });
  });
  
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  const activeRoommate = roommates.find(r => r.id === selectedAnalyticsUser);
  let individualMeals = 0;
  const individualHistory: { date: string; data: any }[] = [];
  
  if (activeRoommate) {
    Object.entries(dailyMeals).forEach(([date, day]) => {
      if (day[activeRoommate.id]) {
        const mealsCount = calculateMeals(day[activeRoommate.id]);
        if (mealsCount > 0) {
          individualMeals += mealsCount;
          individualHistory.push({ date, data: day[activeRoommate.id] });
        }
      }
    });
    individualHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const todayLocalString = new Date().toLocaleDateString();
  const todaysPayments = payments.filter(p => new Date(p.created_at).toLocaleDateString() === todayLocalString);

  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return alert("Please select a Source Entity (Member) before committing the transaction.");
    if (!amount || !note) return alert("Please fill out both the amount and note.");
    
    setIsSubmitting(true);
    try {
      await addPayment(selectedUser, Number(amount), note);
      setSelectedUser('');
      setAmount('');
      setNote('');
      setSuccessMessage('Payment successfully posted!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert("Failed to submit payment transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    await addMember(newMemberName.trim());
    setNewMemberName('');
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 pb-24 relative overflow-x-hidden">
      
      <header className="flex justify-between items-center pt-4 relative z-50 min-h-[60px]">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Bachelor Mess Tracker</h1>
        
        {activeTab === 'entries' && (
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white/80 transition-all active:scale-95 text-slate-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <MoreVertical className="w-6 h-6" />}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-3xl border border-white shadow-2xl rounded-3xl p-5 flex flex-col gap-4 origin-top-right animate-in fade-in zoom-in-95 duration-200 z-50">
                
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Manage Roster</h3>
                
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="New member name..." 
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="flex-1 bg-slate-100/50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors active:scale-95">
                    <UserPlus className="w-5 h-5" />
                  </button>
                </form>

                <div className="border-t border-slate-200 pt-3 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {roommates.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-100/80 transition-colors">
                      <span className="font-bold text-slate-700">{r.name}</span>
                      <button 
                        onClick={() => { if(confirm(`Remove ${r.name}?`)) deleteMember(r.id); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 mt-1 flex flex-col gap-2">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Today&apos;s Transactions (Undo)</h3>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {todaysPayments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No transactions posted today.</p>
                    ) : (
                      todaysPayments.map(p => {
                        const member = roommates.find(r => r.id === p.roommate_id);
                        return (
                          <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{p.description}</span>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{member?.name} • ৳{Number(p.amount).toFixed(2)}</span>
                            </div>
                            <button 
                              onClick={() => { if(confirm(`Delete this ৳${p.amount} payment? The money will be deducted from their balance.`)) deletePayment(p.id); }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 1. MASTER LEDGER TAB (Merged Analytics + Ledger) */}
      {activeTab === 'ledger' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* NEW: DESCO GRID ANALYTICS COMPONENT */}
          <DescoAnalytics accountNo="41095956" />

          {/* Global Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Month Cost</p>
              <p className="text-4xl font-black text-slate-800">৳{totalCost.toFixed(2)}</p>
            </div>
            <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Meals Logged</p>
              <p className="text-4xl font-black text-slate-800">{totalMeals}</p>
            </div>
            <div className="p-6 rounded-squircle bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Meal Rate</p>
              <p className="text-4xl font-black text-blue-600">৳{mealRate.toFixed(2)}</p>
            </div>
          </div>

          {/* Financial Balance Sheets */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Financial Balance Sheets</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                    <th className="pb-4 min-w-[120px]">Member Entity</th>
                    <th className="pb-4">Meals</th>
                    <th className="pb-4">Funded (BDT)</th>
                    <th className="pb-4">Cost (BDT)</th>
                    <th className="pb-4 text-right min-w-[120px]">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                  {roommates.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-400 font-medium">No members registered in roster.</td></tr>
                  ) : (
                    roommates.map((member) => {
                      let memMeals = 0;
                      Object.values(dailyMeals).forEach(day => {
                        if(day[member.id]) memMeals += calculateMeals(day[member.id]);
                      });
                      const memCost = memMeals * mealRate;
                      const finalBalance = member.spent - memCost;

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">{member.name}</td>
                          <td className="py-4 text-slate-500">{memMeals}</td>
                          <td className="py-4 text-emerald-600">৳{member.spent.toFixed(2)}</td>
                          <td className="py-4 text-amber-600">৳{memCost.toFixed(2)}</td>
                          <td className={`py-4 text-right font-black ${finalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {finalBalance >= 0 ? '+' : '-'}৳{Math.abs(finalBalance).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Member Analytics */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-black text-slate-800">Individual Insights</h2>
              <select 
                value={selectedAnalyticsUser} 
                onChange={(e) => setSelectedAnalyticsUser(e.target.value)}
                className="bg-white/80 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none shadow-sm cursor-pointer min-w-[200px]"
              >
                <option value="">Select a member...</option>
                {roommates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {!activeRoommate ? (
              <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-bold">Select a member from the dropdown to view their insights.</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Meals Had</p>
                    <p className="text-2xl font-black text-slate-800">{individualMeals}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Contributed</p>
                    <p className="text-2xl font-black text-emerald-700">৳{activeRoommate.spent.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Meal Cost</p>
                    <p className="text-2xl font-black text-amber-700">৳{(individualMeals * mealRate).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Net Balance</p>
                    <p className="text-2xl font-black text-blue-700">
                      {activeRoommate.spent - (individualMeals * mealRate) >= 0 ? '+' : '-'}
                      ৳{Math.abs(activeRoommate.spent - (individualMeals * mealRate)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">Detailed Meal History</h3>
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {individualHistory.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">No meals recorded for this member yet.</p>
                  ) : (
                    individualHistory.map((entry, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm gap-3">
                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm w-max">
                          {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                          {entry.data.noon && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-orange-100 text-orange-700 border border-orange-200">Lunch</span>}
                          {entry.data.night && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">Dinner</span>}
                          {entry.data.hasGuest && entry.data.guestNoon && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">Guest Lunch</span>}
                          {entry.data.hasGuest && entry.data.guestNight && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">Guest Dinner</span>}
                          
                          {entry.data.is_edited && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 sm:ml-4">
                              Edited
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Historical Cost Registry */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Historical Cost Registry</h2>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No transactions logged in the registry yet.</p>
              ) : (
                payments.map((log) => {
                  const payer = roommates.find(r => r.id === log.roommate_id);
                  return (
                    <div key={log.id} className="flex justify-between items-center py-3 first:pt-0">
                      <div>
                        <p className="text-base font-bold text-slate-800">{log.description}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-1">
                          Posted by <span className="text-blue-600">{payer ? payer.name : 'Unknown Entity'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">+ ৳{Number(log.amount).toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ENTRIES TAB (Meals + Post Payment) */}
      {activeTab === 'entries' && (
        <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Daily Meal Matrix */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-slate-800">Daily Meal Matrix</h2>
              <div className="inline-flex flex-col p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Timeline Selector</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-lg font-black text-slate-800 outline-none cursor-pointer" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roommates.map(roommate => <MealAdjuster key={roommate.id} {...roommate} />)}
            </div>
          </div>

          <hr className="border-slate-200 border-dashed" />

          {/* Post Payment Form */}
          <div className="max-w-2xl mx-auto w-full">
            <form onSubmit={handlePostPayment} className="p-6 md:p-10 rounded-squircle bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl flex flex-col gap-6 relative overflow-hidden">
              {successMessage && (
                <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-sm font-bold shadow-md">
                  {successMessage}
                </div>
              )}
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Post Capital Expense</h2>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Entity (Member)</label>
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none shadow-sm cursor-pointer"
                >
                  <option value="">Select a member...</option>
                  {roommates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid (BDT ৳)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g., 500.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none shadow-inner"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Specifications</label>
                <textarea 
                  placeholder="e.g., Rice, Chicken, Utility Bills..." 
                  rows={3} 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none shadow-inner resize-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-lg"
              >
                {isSubmitting ? 'Synchronizing...' : 'Commit Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}