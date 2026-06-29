'use client';

import React from 'react';
import { useMessStore } from '../store/useMessStore';
import MealAdjuster from './MealAdjuster'; 

export default function MealList() {
  const activeRoommates = useMessStore((state) => 
    state.roommates.filter((r) => r.is_active !== false) // Uses is_active
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