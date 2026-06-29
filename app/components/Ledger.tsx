'use client';

import React from 'react';
import { useMessStore } from '../store/useMessStore';

interface LedgerProps {
  selectedMonth: string; // Format expected: "YYYY-MM"
}

export default function Ledger({ selectedMonth }: LedgerProps) {
  const { members, meals, payments } = useMessStore();

  // Filter members dynamically based on activity status and historical transaction data
  const visibleLedgerMembers = members.filter((member) => {
    // 1. Active members are always included in calculation pools
    if (member.is_active !== false) return true; 

    // 2. Inactive members are included only if they consumed meals or paid during this specific month
    const hasMealsThisMonth = meals.some(
      (meal) => 
        meal.member_id === member.id && 
        meal.month === selectedMonth && 
        meal.count > 0
    );

    const hasPaymentsThisMonth = payments.some(
      (payment) => 
        payment.member_id === member.id && 
        payment.month === selectedMonth &&
        payment.amount > 0
    );

    return hasMealsThisMonth || hasPaymentsThisMonth;
  });

  // Calculation Logic 
  const calculateTotalMeals = (memberId: string) => {
    return meals
      .filter((m) => m.member_id === memberId && m.month === selectedMonth)
      .reduce((sum, item) => sum + item.count, 0);
  };

  const calculateTotalPayments = (memberId: string) => {
    return payments
      .filter((p) => p.member_id === memberId && p.month === selectedMonth)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Monthly Calculation Ledger</h3>
      <div className="space-y-3">
        {visibleLedgerMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">No ledger data for this month.</p>
        ) : (
          visibleLedgerMembers.map((member) => {
            const totalMeals = calculateTotalMeals(member.id);
            const totalPayments = calculateTotalPayments(member.id);
            
            return (
              <div key={member.id} className="flex justify-between items-center border-b pb-3 pt-2">
                <div>
                  <span className="font-semibold text-gray-900">{member.name}</span>
                  {member.is_active === false && (
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
                    Paid: <span className="font-bold text-gray-900">{totalPayments}</span>
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