"use client";
import { useMessStore, calculateMeals } from '../store/useMessStore';

export default function Ledger() {
  const { roommates, dailyMeals, updateSpent } = useMessStore();

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
    <div className="p-6 md:p-8 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg">
      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Month-to-Date Ledger</h2>
      <p className="text-sm text-slate-500 font-medium mb-6">Log market expenses here to automatically calculate balances.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-white/40 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-4 font-extrabold">Roommate</th>
              <th className="pb-4 font-extrabold">Meals</th>
              <th className="pb-4 font-extrabold hidden md:table-cell">Their Cost</th>
              <th className="pb-4 font-extrabold">Amount Paid ($)</th>
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
                  
                  {/* Editable Expense Input directly in the table */}
                  <td className="py-4">
                    <input
                      type="number"
                      value={r.spent}
                      onChange={(e) => updateSpent(r.id, Number(e.target.value))}
                      className="w-24 bg-white/60 border border-white/40 rounded-lg p-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner"
                    />
                  </td>
                  
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
  );
}