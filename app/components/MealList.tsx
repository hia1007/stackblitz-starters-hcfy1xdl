'use client';

import React from 'react';

export default function MealList() {
  // Dummy data to check if the component renders properly
  const dummyMeals = [
    { id: 1, name: 'Breakfast', count: 1 },
    { id: 2, name: 'Lunch', count: 2 },
    { id: 3, name: 'Dinner', count: 1 },
  ];

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Meal List</h2>
      
      <ul className="divide-y divide-gray-200">
        {dummyMeals.map((meal) => (
          <li key={meal.id} className="flex items-center justify-between py-3 text-sm">
            <span className="font-medium text-gray-700">{meal.name}</span>
            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
              {meal.count} meals
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}