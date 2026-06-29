'use client';

import React from 'react';
import { useMessStore } from '../store/useMessStore';
import MealAdjuster from './MealAdjuster'; 

export default function MealList() {
  // Best practice: Select the array and filter it here so React re-renders instantly when isActive changes
  const activeRoommates = useMessStore((state) => 
    state.roommates.filter((r) => r.isActive !== false)
  );

  if (activeRoommates.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
        No active members found for this month.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Map through active users and render their individual meal controls */}
      {activeRoommates.map((roommate) => (
        <MealAdjuster
          key={roommate.id}
          id={roommate.id}
          name={roommate.name}
          spent={roommate.spent}
        />
      ))}
    </div>
  );
}