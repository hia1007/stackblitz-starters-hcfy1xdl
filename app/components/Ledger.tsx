"use client";
import { useMessStore, calculateMeals } from '../store/useMessStore';

export default function Ledger() {
  const { roommates, dailyMeals, payments } = useMessStore();

  // Mathematical Calculations for Balances
  let totalMeals = 0;
  const userTotalMeals: Record<string, number> = {};
  roommates.forEach(r => userTotalMeals[r.id] = 0);

  Object.values(dailyMeals).forEach(dayRecord => {
    roommates.forEach(r => {
      const mealsForDay = calculateMeals(dayRecord[r.id]);
      userTotalMeals[r.id] += mealsForDay;
      totalMeals += mealsForDay;
    });
  });

  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* SECTION 1: READ-ONLY BALANCES */}
      <div className="p-6 md:p-8 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg">
        <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Current Balances</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-white/40 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-4 font-extrabold">Member Name</th>
                <th className="pb-4 font-extrabold">Meals</th>
                <th className="pb-4 font-extrabold hidden md:table-cell">Meal Cost</th>
                <th className="pb-4 font-extrabold">Total Paid</th>
                <th className="pb-4 font-extrabold text-right">Final Balance</th>
              </tr>
            </thead>
            <tbody>
              {roommates.map((r) => {
                const myMeals = userTotalMeals[r.id];
                const individualCost = myMeals * mealRate;
                const balance = r.spent - individualCost;
                const isOwed = balance >= 0;

                return (
                  <tr key={r.id} className="border-b border-white/30 last:border-0 hover:bg-white/20 transition-colors">
                    <td className="py-4 font-bold text-slate-800">{r.name}</td>
                    <td className="py-4 text-slate-600 font-medium">{myMeals}</td>
                    <td className="py-4 text-slate-600 font-medium hidden md:table-cell">${individualCost.toFixed(2)}</td>
                    <td className="py-4 font-bold text-slate-800">${r.spent.toFixed(2)}</td>
                    <td className={`py-4 font-black text-right ${isOwed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isOwed ? '+' : ''}${balance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: PERMANENT PAYMENT HISTORY */}
      <div className="p-6 md:p-8 rounded-squircle bg-white/30 backdrop-blur-xl border border-white/40 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Payment History Log</h2>
        {payments.length === 0 ? (
          <p className="text-sm font-medium text-slate-500 italic">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-white/30 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="pb-3 font-extrabold">Date & Time</th>
                  <th className="pb-3 font-extrabold">Member Name</th>
                  <th className="pb-3 font-extrabold">Note / Purpose</th>
                  <th className="pb-3 font-extrabold text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => {
                  const memberName = roommates.find(r => r.id === payment.roommate_id)?.name || 'Unknown';
                  const dateObj = new Date(payment.created_at);
                  const formattedDate = `${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

                  return (
                    <tr key={payment.id} className="border-b border-white/20 last:border-0">
                      <td className="py-3 text-xs font-medium text-slate-500">{formattedDate}</td>
                      <td className="py-3 text-sm font-bold text-slate-800">{memberName}</td>
                      <td className="py-3 text-sm text-slate-600">{payment.description}</td>
                      <td className="py-3 text-sm font-black text-emerald-600 text-right">+${Number(payment.amount).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}