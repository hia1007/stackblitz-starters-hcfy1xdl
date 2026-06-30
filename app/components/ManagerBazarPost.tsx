"use client";
import React, { useState } from 'react';
import { useMessStore } from '../store/useMessStore';
import { Calendar, PlusCircle, Trash2 } from 'lucide-react';

export default function ManagerBazarPost() {
  const { getActiveRoommates, postBazarDate, bazarSchedule, deleteBazarDate, roommates } = useMessStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedDate) return;

    setIsSubmitting(true);
    await postBazarDate(selectedUser, selectedDate);
    setSelectedDate('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-slate-800 text-lg">Assign Bazar Schedule</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end mb-6">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Member</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full text-sm font-medium border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-indigo-500"
            required
          >
            <option value="">Choose a roommate...</option>
            {getActiveRoommates().map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bazar Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-sm font-medium border border-slate-200 rounded-xl p-2 bg-slate-50 focus:outline-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          {isSubmitting ? 'Posting...' : 'Post Date'}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Active Assigned Schedule</h4>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {bazarSchedule.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No future dates posted yet.</p>
          ) : (
            bazarSchedule.map((entry) => {
              const name = roommates.find(r => r.id === entry.roommate_id)?.name || 'Unknown';
              return (
                <div key={entry.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs font-semibold">
                  <span className="text-slate-700"><b className="text-slate-900">{name}</b> - {entry.date}</span>
                  <button onClick={() => deleteBazarDate(entry.id)} className="text-rose-500 hover:text-rose-700 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}