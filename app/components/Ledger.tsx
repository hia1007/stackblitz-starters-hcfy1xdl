'use client';

import React from 'react';
import { useMessStore, calculateMeals } from '../store/useMessStore';
import PublicBazarView from './PublicBazarView'; // NEW IMPORT

interface LedgerProps {
  selectedMonth: string; // Format expected: "YYYY-MM"
}

export default function Ledger({ selectedMonth }: LedgerProps) {
  const { roommates, dailyMeals, payments } = useMessStore();

  const currentCalendarMonth = new Date().toISOString().slice(0, 7);

  const visibleLedgerMembers = roommates.filter((roommate) => {
    
    const createdAt = (roommate as any).created_at;
    if (createdAt) {
      const joinedMonth = createdAt.substring(0, 7);
      if (selectedMonth < joinedMonth) {
        return false; 
      }
    }

    const datesInMonth = Object.keys(dailyMeals).filter(date => date.startsWith(selectedMonth));
    const hasMealsThisMonth = datesInMonth.some(date => {
      const mealOptions = dailyMeals[date]?.[roommate.id];
      return calculateMeals(mealOptions) > 0;
    });

    const hasPaymentsThisMonth = payments.some(
      (payment) => 
        payment.roommate_id === roommate.id && 
        payment.created_at.startsWith(selectedMonth) &&
        payment.amount > 0
    );

    if (hasMealsThisMonth || hasPaymentsThisMonth) return true;

    return roommate.is_active !== false && selectedMonth === currentCalendarMonth;
  });

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
    <div className="space-y-6">
      
      {/* NEW: PUBLIC BAZAR SCHEDULE INJECTED HERE */}
      <PublicBazarView />

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
    </div>
  );
}