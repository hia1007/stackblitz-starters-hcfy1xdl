"use client";
import { useState, useEffect } from 'react';
import MealAdjuster from './components/MealAdjuster';
import { useMessStore, calculateMeals } from './store/useMessStore';
import { useAuthStore } from './store/useAuthStore'; 
import BottomDock from './components/BottomDock';
import { MoreVertical, UserPlus, Trash2, X, ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import DescoAnalytics from './components/DescoAnalytics';
import LoginButton from './components/LoginButton';
import MonthSelector from './components/MonthSelector'; 

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'entries'>('ledger');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeletePage, setShowDeletePage] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const [selectedAnalyticsUser, setSelectedAnalyticsUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { roommates, dailyMeals, payments, selectedDate, selectedMonth, setSelectedDate, setSelectedMonth, fetchData, isLoaded, addPayment, addMember, deleteMember, deletePayment } = useMessStore();
  
  const { user, role, signOut } = useAuthStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (roommates.length > 0) {
      if (selectedAnalyticsUser && !roommates.some(r => r.id === selectedAnalyticsUser)) setSelectedAnalyticsUser('');
      if (selectedUser && !roommates.some(r => r.id === selectedUser)) setSelectedUser('');
    }
  }, [roommates, selectedAnalyticsUser, selectedUser]);

  if (!isLoaded) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-bold text-slate-500 animate-pulse">Synchronizing Mess Engine...</p>
      </main>
    );
  }

  const handleDeleteAttempt = async (id: string, name: string) => {
    const code = window.prompt(`WARNING: You are about to permanently delete ${name}.\n\nEnter the Mastercode to confirm:`);
    if (code === '007') {
      const success = await deleteMember(id); 
      if (success) {
         alert(`${name} was successfully deleted.`); 
      }
    } else if (code !== null) { 
      alert('Authentication Failed: Incorrect mastercode.');
    }
  };

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
  
  const monthlyDates = Object.keys(dailyMeals).filter(date => date.startsWith(selectedMonth));
  const monthlyPayments = payments.filter(p => p.created_at.startsWith(selectedMonth));

  // ==========================================
  // ⚡ THE TWO SEPARATE LISTS ⚡
  // ==========================================
  
  // 1. STRICT LIST: Only truly active members (For Matrix & Settings)
  const strictlyActiveRoommates = roommates.filter(r => r.is_active !== false);

  // 2. LEDGER LIST: Active members PLUS deleted members who have history this month (For Math & Ledgers)
  const now = new Date();
  const currentCalendarMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const ledgerRoommatesForMonth = roommates.filter(r => {
    const hasMealsThisMonth = monthlyDates.some(date => dailyMeals[date]?.[r.id]);
    const hasPaymentsThisMonth = monthlyPayments.some(p => p.roommate_id === r.id);
    
    // If they have activity, always show them in the ledger
    if (hasMealsThisMonth || hasPaymentsThisMonth) return true;

    // Rule B: If they have 0 activity, ONLY show them if they are active AND we are looking at the current or future month
    return r.is_active !== false && selectedMonth >= currentCalendarMonth;
  });

  // Calculate totals based on the LEDGER list
  let totalMonthlyMeals = 0;
  monthlyDates.forEach(date => {
    ledgerRoommatesForMonth.forEach(r => { if (dailyMeals[date][r.id]) totalMonthlyMeals += calculateMeals(dailyMeals[date][r.id]); });
  });

  const totalMonthlyCost = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyMealRate = totalMonthlyMeals > 0 ? totalMonthlyCost / totalMonthlyMeals : 0;

  const activeRoommate = ledgerRoommatesForMonth.find(r => r.id === selectedAnalyticsUser);
  let individualMonthlyMeals = 0;
  let individualMonthlySpent = 0;
  const individualMonthlyHistory: { date: string; data: any }[] = [];

  if (activeRoommate) {
    individualMonthlySpent = monthlyPayments
      .filter(p => p.roommate_id === activeRoommate.id)
      .reduce((sum, p) => sum + p.amount, 0);

    monthlyDates.forEach(date => {
      if (dailyMeals[date][activeRoommate.id]) {
        const mealsCount = calculateMeals(dailyMeals[date][activeRoommate.id]);
        if (mealsCount > 0) {
          individualMonthlyMeals += mealsCount;
          individualMonthlyHistory.push({ date, data: dailyMeals[date][activeRoommate.id] });
        }
      }
    });
    individualMonthlyHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const todayLocalString = new Date().toLocaleDateString();
  const todaysPayments = payments.filter(p => new Date(p.created_at).toLocaleDateString() === todayLocalString);

  if (showDeletePage) {
    return (
      <main className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300 pb-24">
        <div className="flex items-center gap-4 mb-2 pt-4">
          <button onClick={() => setShowDeletePage(false)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Manage Members</h1>
        </div>
        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl rounded-3xl p-6 md:p-8">
          <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">Select a member to remove from the roster</p>
          {strictlyActiveRoommates.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl"><p className="text-slate-500 font-bold">Roster is empty.</p></div>
          ) : (
            <div className="flex flex-col gap-2 divide-y divide-slate-100">
              {/* Uses STRICT list so they vanish immediately */}
              {strictlyActiveRoommates.map(r => (
                <div key={r.id} className="flex justify-between items-center py-4 first:pt-0">
                  <span className="font-black text-lg text-slate-800">{r.name}</span>
                  <button onClick={() => handleDeleteAttempt(r.id, r.name)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-black rounded-xl flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6 pb-24 relative overflow-x-hidden animate-in fade-in duration-300">
      <header className="flex justify-between items-center pt-4 relative z-50 min-h-[60px]">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Bachelor Mess Tracker</h1>
        
        {activeTab === 'entries' && user && role === 'manager' && (
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white/80 transition-all active:scale-95">
              {isMenuOpen ? <X className="w-6 h-6" /> : <MoreVertical className="w-6 h-6" />}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-3xl border border-white shadow-2xl rounded-3xl p-5 flex flex-col gap-4 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Manager Portal</h3>

                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider border-t border-slate-200 pt-3">Add to Roster</h3>
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <input type="text" placeholder="New member name..." value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="flex-1 bg-slate-100/50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors active:scale-95 shadow-md"><UserPlus className="w-5 h-5" /></button>
                </form>

                <div className="border-t border-slate-200 pt-4 mt-1">
                  <button onClick={() => { setIsMenuOpen(false); setShowDeletePage(true); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-black tracking-wide rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Trash2 className="w-5 h-5" /> Delete Member
                  </button>
                  <button onClick={() => { setIsMenuOpen(false); signOut(); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black tracking-wide rounded-xl flex items-center justify-center gap-2 transition-colors mt-2">
                    <X className="w-5 h-5" /> Logout
                  </button>
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
                            <div className="flex flex-col"><span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{p.description}</span><span className="text-[9px] font-black text-slate-400">by {member?.name}</span></div>
                            <button onClick={() => { if(confirm(`Delete this ৳ ${p.amount} payment?`)) deletePayment(p.id); }} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <DescoAnalytics accountNo="41095956" />
          
          <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center"><p className="text-xs font-bold text-slate-500 uppercase">Total Members</p><p className="text-3xl font-black text-slate-800 mt-2">{ledgerRoommatesForMonth.length}</p></div>
            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center"><p className="text-xs font-bold text-slate-500 uppercase">Monthly Meals</p><p className="text-3xl font-black text-slate-800 mt-2">{totalMonthlyMeals}</p></div>
            <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-md flex flex-col justify-center items-center"><p className="text-xs font-bold text-slate-500 uppercase">Per Meal Cost</p><p className="text-3xl font-black text-emerald-600 mt-2">৳ {monthlyMealRate.toFixed(2)}</p></div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl overflow-hidden">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Monthly Balance Sheets</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="border-b-2 border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider"><th className="pb-4 min-w-[120px]">Member Entity</th><th className="pb-4">Meals</th><th className="pb-4">Spent</th><th className="pb-4">Cost</th><th className="pb-4 text-right">Balance</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                  {ledgerRoommatesForMonth.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-400 font-medium">No members registered in roster.</td></tr>
                  ) : (
                    ledgerRoommatesForMonth.map((member) => {
                      let memMeals = 0;
                      monthlyDates.forEach(date => { if(dailyMeals[date][member.id]) memMeals += calculateMeals(dailyMeals[date][member.id]); });
                      const memSpent = monthlyPayments.filter(p => p.roommate_id === member.id).reduce((sum, p) => sum + p.amount, 0);
                      const memCost = memMeals * monthlyMealRate;
                      const finalBalance = memSpent - memCost;
                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">{member.name}</td>
                          <td className="py-4 text-slate-500">{memMeals}</td>
                          <td className="py-4 text-emerald-600">৳ {memSpent.toFixed(2)}</td>
                          <td className="py-4 text-amber-600">৳ {memCost.toFixed(2)}</td>
                          <td className={`py-4 text-right font-black ${finalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{finalBalance >= 0 ? '+' : '-'} ৳ {Math.abs(finalBalance).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-black text-slate-800">Monthly Individual Insights</h2>
              <select value={selectedAnalyticsUser} onChange={(e) => setSelectedAnalyticsUser(e.target.value)} className="bg-white/80 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a member...</option>
                {ledgerRoommatesForMonth.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {!activeRoommate ? (
              <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl"><p className="text-slate-500 font-bold">Select a member from the dropdown above.</p></div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Meals Had</p><p className="text-2xl font-black text-slate-800 mt-1">{individualMonthlyMeals}</p></div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center"><p className="text-[10px] font-bold text-emerald-600 uppercase">Contributed</p><p className="text-2xl font-black text-emerald-600 mt-1">৳ {individualMonthlySpent.toFixed(2)}</p></div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center"><p className="text-[10px] font-bold text-amber-600 uppercase">Meal Cost</p><p className="text-2xl font-black text-amber-600 mt-1">৳ {(individualMonthlyMeals * monthlyMealRate).toFixed(2)}</p></div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center"><p className="text-[10px] font-bold text-blue-600 uppercase">Net Balance</p><p className={`text-2xl font-black mt-1 ${individualMonthlySpent - (individualMonthlyMeals * monthlyMealRate) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{individualMonthlySpent - (individualMonthlyMeals * monthlyMealRate) >= 0 ? '+' : '-'} ৳ {Math.abs(individualMonthlySpent - (individualMonthlyMeals * monthlyMealRate)).toFixed(2)}</p></div>
                </div>
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">Detailed Meal History</h3>
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {individualMonthlyHistory.length === 0 ? (
                    <p className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl">No meals recorded for this member in this month.</p>
                  ) : (
                    individualMonthlyHistory.map((entry, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm gap-3">
                        <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm w-max">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                          {entry.data.noon && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-orange-100 text-orange-700 border border-orange-200">Lunch</span>}
                          {entry.data.night && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">Dinner</span>}
                          {entry.data.hasGuest && entry.data.guestNoon && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">Guest Lunch</span>}
                          {entry.data.hasGuest && entry.data.guestNight && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">Guest Dinner</span>}
                          {entry.data.is_edited && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 sm:ml-auto">Edited</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Historical Cost Registry</h2>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 divide-y divide-slate-100">
              {monthlyPayments.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No transactions logged for this month yet.</p>
              ) : (
                monthlyPayments.map((log) => {
                  const payer = roommates.find(r => r.id === log.roommate_id);
                  return (
                    <div key={log.id} className="flex justify-between items-center py-3 first:pt-0">
                      <div><p className="text-base font-bold text-slate-800">{log.description}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-1">Posted by <span className="text-slate-700">{payer?.name}</span></p></div>
                      <div className="text-right"><p className="text-lg font-black text-emerald-600">+ ৳ {Number(log.amount).toFixed(2)}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleDateString()}</p></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ENTRIES TAB */}
      {activeTab === 'entries' && (
        <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {!user ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl mt-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6"><Lock className="w-10 h-10 text-blue-600" /></div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">Access Restricted</h2>
              <p className="text-slate-500 font-bold mb-8 max-w-sm">Enter the secret manager code to access master entries and manage the system.</p>
              <LoginButton />
            </div>
          ) : (
            <>
              {role !== 'manager' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 font-bold shadow-sm">
                  <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm">You are viewing in <strong>Member Mode</strong>. Only assigned Managers can toggle meals or post new capital expenses.</p>
                </div>
              )}

              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-slate-800">Daily Meal Matrix</h2>
                  <div className="inline-flex flex-col p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Timeline Selector</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} disabled={role !== 'manager'} className="bg-transparent text-lg font-black text-slate-800 focus:outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Uses STRICT list so they vanish immediately */}
                  {strictlyActiveRoommates.map(roommate => <MealAdjuster key={roommate.id} {...roommate} />)}
                </div>
              </div>

              {role === 'manager' && (
                <>
                  <hr className="border-slate-200 border-dashed" />
                  <div className="max-w-2xl mx-auto w-full">
                    <form onSubmit={handlePostPayment} className="p-6 md:p-10 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl flex flex-col gap-6 relative overflow-hidden">
                      {successMessage && <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-sm font-bold shadow-md">{successMessage}</div>}
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">Post Capital Expense</h2>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Entity (Member)</label>
                        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select a member...</option>
                          {/* Uses STRICT list so they vanish immediately */}
                          {strictlyActiveRoommates.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid (BDT ৳)</label>
                        <input type="number" step="0.01" placeholder="e.g., 500.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction Specifications</label>
                        <textarea placeholder="e.g., Rice, Chicken, Utility Bills..." rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="bg-white/80 border border-white/40 rounded-xl p-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                      </div>

                      <button type="submit" disabled={isSubmitting} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-95 disabled:bg-blue-400">
                        {isSubmitting ? 'Synchronizing...' : 'Commit Transaction'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}