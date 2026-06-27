'use client';

import React, { useState } from 'react';
import { useMessStore } from '../store/useMessStore';

export default function Ledger() {
  const { roommates, addMember, deleteMember } = useMessStore();
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsAdding(true);
    await addMember(newName.trim()); 
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      
      {/* ➕ ADD NEW MEMBER FORM */}
      <div className="p-6 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg">
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4">Add New Mess Member</h2>
        <form onSubmit={handleAddMember} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter member's name (e.g., Sifat)..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-grow bg-white/60 border border-white/40 rounded-xl p-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner"
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* 📊 EXISTING MEMBERS SUMMARY */}
      <div className="p-6 rounded-squircle bg-white/50 backdrop-blur-2xl border border-white/60 shadow-lg">
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4">Current Members Summary</h2>
        <div className="divide-y divide-white/40">
          {roommates.length === 0 ? (
            <p className="text-sm text-slate-500 font-medium py-4 text-center">No members added yet. Create one above!</p>
          ) : (
            roommates.map((member) => (
              <div key={member.id} className="flex justify-between items-center py-3">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{member.name}</span>
                  <span className="text-xs font-semibold text-slate-500">ID: {member.id}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-slate-600 bg-white/60 px-3 py-1 rounded-lg">
                    Spent: ${member.spent.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => {
                      if(confirm(`Are you sure you want to remove ${member.name}?`)) {
                        deleteMember(member.id);
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}