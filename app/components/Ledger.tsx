"use client";
import { useMessStore } from '../store/useMessStore';

export default function Ledger() {
  const roommates = useMessStore(state => state.roommates);

  // Re-calculate the global variables for the ledger logic
  const totalCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const totalMeals = roommates.reduce((sum, r) => sum + r.meals, 0);
  const mealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

  return (
    <div className="mt-8 p-6 md:p-8 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg">
      <h2 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">End of Month Settlement</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-white/40 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-4 font-extrabold">Roommate</th>
              <th className="pb-4 font-extrabold hidden md:table-cell">Their Cost (${mealRate.toFixed(2)}/meal)</th>
              <th className="pb-4 font-extrabold hidden md:table-cell">Amount Paid</th>
              <th className="pb-4 font-extrabold text-right">Final Balance</th>
            </tr>
          </thead>
          <tbody>
            {roommates.map((r) => {
              const individualCost = r.meals * mealRate;
              const balance = r.spent - individualCost;
              // If balance is positive, they spent more than they ate (Manager owes them).
              const isOwed = balance >= 0;

              return (
                <tr key={r.id} className="border-b border-white/30 last:border-0 hover:bg-white/20 transition-colors">
                  <td className="py-4 font-bold text-slate-800">{r.name}</td>
                  <td className="py-4 text-slate-600 font-medium hidden md:table-cell">
                    ${individualCost.toFixed(2)}
                  </td>
                  <td className="py-4 text-slate-600 font-medium hidden md:table-cell">
                    ${r.spent.toFixed(2)}
                  </td>
                  <td className={`py-4 font-black text-right ${isOwed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isOwed ? '+' : ''}${balance.toFixed(2)}
                    <div className="text-[10px] font-bold uppercase mt-1 opacity-80">
                      {isOwed ? 'Manager Owes Them' : 'They Owe Manager'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}