'use client';

import React from 'react';
import { useMessStore } from '../store/useMessStore';
import MealAdjuster from './MealAdjuster'; 

export default function MealList() {
  const { roommates, isLoaded } = useMessStore();

  if (!isLoaded) return <div className="text-center p-4">Loading matrix...</div>;

  // Filter out soft-deleted members for the active daily tracking view
  const activeRoommates = roommates.filter((roommate) => roommate.is_active !== false);

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Daily Meal Matrix</h2>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 font-semibold text-gray-600">Member Name</th>
            <th className="p-3 font-semibold text-gray-600">Meal Count</th>
          </tr>
        </thead>
        <tbody>
          {activeRoommates.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-4 text-center text-gray-500">
                No active members found.
              </td>
            </tr>
          ) : (
            activeRoommates.map((roommate) => (
              <tr key={roommate.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-gray-900">{roommate.name}</td>
                <td className="p-3">
                  {/* Ensure the prop name matches what MealAdjuster expects (usually memberId or userId) */}
                  <MealAdjuster memberId={roommate.id} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}