"use client";
import React from 'react';
import { useMessStore } from '../store/useMessStore';
import { ShoppingBag, Clock } from 'lucide-react';

export default function PublicBazarView() {
  const { bazarSchedule, roommates, selectedMonth } = useMessStore();

  const filteredSchedule = bazarSchedule.filter(entry => entry.date.startsWith(selectedMonth));

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-xl mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-100 rounded-xl">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-800 tracking-tight">Shopping Rotation (Bazar)</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Who is buying when</p>
        </div>
      </div>

      {filteredSchedule.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-slate-500">No scheduled dates for this cycle</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredSchedule.map((entry) => {
            const member = roommates.find((r) => r.id === entry.roommate_id);
            // Formats the date nicely (e.g., "Mon, Jul 15")
            const formattedDate = new Date(entry.date).toLocaleDateString('default', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            });

            return (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3.5 bg-white border border-slate-100 shadow-sm rounded-xl"
              >
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="text-sm font-black text-slate-800">{formattedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shopper</p>
                  <p className="text-sm font-black text-indigo-600">{member ? member.name : 'Unknown'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}