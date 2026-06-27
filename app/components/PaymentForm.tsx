'use client';

import React, { useState } from 'react';

export default function PaymentForm() {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect this to your store or Supabase backend
    console.log('Submitting payment for:', amount);
    setAmount(''); 
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Add Payment</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="amount"
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