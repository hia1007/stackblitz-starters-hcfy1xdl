'use client';

import React, { useState } from 'react';
import { useMessStore } from '../store/useMessStore';

export default function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [note, setNote] = useState('');
  
  // Pull the addPayment function
  const addPayment = useMessStore((state) => state.addPayment);
  
  // Filter active members safely for the dropdown
  const activeRoommates = useMessStore((state) => 
    state.roommates.filter((r) => r.isActive !== false)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
        alert("Please select a member.");
        return;
    }

    try {
        // Enforce conversion to Number here!
        await addPayment(selectedUserId, Number(amount), note || "Deposit");
        alert("Payment added successfully!");
        setAmount(''); 
        setNote('');
        setSelectedUserId('');
    } catch (error: any) {
        alert(`Failed to submit payment transaction: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Add Payment</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Member</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>Select a member</option>
            {activeRoommates.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Amount (৳)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          Submit Payment
        </button>
      </form>
    </div>
  );
}