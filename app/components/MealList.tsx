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
      
      {/* If MealAdjuster is now a large card (based on its Tailwind classes), 
          you might prefer a grid layout instead of a table. 
          But here it is seamlessly integrated to pass the exact props needed. */}
      <div className="flex flex-col gap-4">
        {activeRoommates.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No active members found.
          </div>
        ) : (
          activeRoommates.map((roommate) => (
            <div key={roommate.id} className="w-full">
              <MealAdjuster 
                id={roommate.id} 
                name={roommate.name} 
                spent={roommate.spent} 
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}