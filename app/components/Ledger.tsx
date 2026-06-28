'use client';
import React from 'react';
import { useMessStore, calculateMeals } from '../store/useMessStore';

export default function Ledger() {
  const { roommates, dailyMeals, payments } = useMessStore();

  let absoluteMeals = 0;
  Object.values(dailyMeals).forEach(day => {
    roommates.forEach(r => { 
      if (day[r.id]) absoluteMeals += calculateMeals(day[r.id]); 
    });
  });
  const absoluteCost = roommates.reduce((sum, r) => sum + r.spent, 0);
  const sharedRate = absoluteMeals > 0 ? absoluteCost / absoluteMeals : 0;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 📊 EXISTING MEMBERS SUMMARY */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl overflow-hidden">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Financial Balance Sheets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="pb-4">Member Entity</th>
                <th className="pb-4">Meals</th>
                <th className="pb-4">Funded (BDT)</th>
                <th className="pb-4">Cost (BDT)</th>
                <th className="pb-4 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
              {roommates.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-slate-400 font-medium">No members registered in roster.</td></tr>
              ) : (
                roommates.map((member) => {
                  let individualMeals = 0;
                  Object.values(dailyMeals).forEach(day => {
                    if(day[member.id]) individualMeals += calculateMeals(day[member.id]);
                  });
                  const individualCost = individualMeals * sharedRate;
                  const finalBalance = member.spent - individualCost;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">{member.name}</td>
                      <td className="py-4 text-slate-500">{individualMeals}</td>
                      <td className="py-4 text-emerald-600">৳{member.spent.toFixed(2)}</td>
                      <td className="py-4 text-amber-600">৳{individualCost.toFixed(2)}</td>
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

      {/* 📝 TRANSACTION HISTORY */}
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
  );
}