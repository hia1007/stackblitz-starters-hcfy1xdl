'use client';

import React from 'react';
import { useMessStore, calculateMeals } from '../store/useMessStore';

interface LedgerProps {
  selectedMonth: string; // Format expected: "YYYY-MM"
}

export default function Ledger({ selectedMonth }: LedgerProps) {
  const { roommates, dailyMeals, payments } = useMessStore();

  // Get the current real-world month to compare against the selected ledger month
  const currentCalendarMonth = new Date().toISOString().slice(0, 7);

  // Filter members dynamically based on activity and database creation date
  const visibleLedgerMembers = roommates.filter((roommate) => {
    
    // 1. THE BULLETPROOF RULE: Use Supabase's automatic 'created_at' timestamp.
    // If the selected ledger month is BEFORE they were even created in the database, hide them immediately.
    const createdAt = (roommate as any).created_at;
    if (createdAt) {
      const joinedMonth = createdAt.substring(0, 7);
      if (selectedMonth < joinedMonth) {
        return false; 
      }
    }

    // 2. Check if they consumed any meals in the selected month
    const datesInMonth = Object.keys(dailyMeals).filter(date => date.startsWith(selectedMonth));
    const hasMealsThisMonth = datesInMonth.some(date => {
      const mealOptions = dailyMeals[date]?.[roommate.id];
      return calculateMeals(mealOptions) > 0;
    });

    // 3. Check if they made any payments in the selected month
    const hasPaymentsThisMonth = payments.some(
      (payment) => 
        payment.roommate_id === roommate.id && 
        payment.created_at.startsWith(selectedMonth) &&
        payment.amount > 0
    );

    // Rule A: If they have ANY activity (meals or payments) in this month, ALWAYS show them.
    if (hasMealsThisMonth || hasPaymentsThisMonth) return true;

    // Rule B: If they have NO activity this month, ONLY show them if they are an active member 
    // AND we are strictly viewing the current ongoing month. 
    return roommate.is_active !== false && selectedMonth === currentCalendarMonth;
  });

  // Calculation Logic 
  const calculateTotalMealsForMonth = (roomId: string) => {
    const datesInMonth = Object.keys(dailyMeals).filter(date => date.startsWith(selectedMonth));
    return datesInMonth.reduce((sum, date) => {
      const mealOptions = dailyMeals[date]?.[roomId];
      return sum + calculateMeals(mealOptions);
    }, 0);
  };

  const calculateTotalPaymentsForMonth = (roomId: string) => {
    return payments
      .filter((p) => p.roommate_id === roomId && p.created_at.startsWith(selectedMonth))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Monthly Calculation Ledger</h3>
      <div className="space-y-3">
        {visibleLedgerMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">No ledger data for this month.</p>
        ) : (
          visibleLedgerMembers.map((roommate) => {
            const totalMeals = calculateTotalMealsForMonth(roommate.id);
            const totalPayments = calculateTotalPaymentsForMonth(roommate.id);
            
            return (
              <div key={roommate.id} className="flex justify-between items-center border-b pb-3 pt-2">
                <div>
                  <span className="font-semibold text-gray-900">{roommate.name}</span>
                  {roommate.is_active === false && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium border border-red-200">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <div className="mb-1">
                    Meals: <span className="font-bold text-gray-900">{totalMeals}</span>
                  </div>
                  <div>
                    Paid: <span className="font-bold text-gray-900">৳{totalPayments.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}