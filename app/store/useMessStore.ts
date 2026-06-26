import { create } from 'zustand';

type Roommate = { id: string; name: string; meals: number; spent: number; };

interface MessStore {
  roommates: Roommate[];
  updateMeals: (id: string, meals: number) => void;
  updateSpent: (id: string, spent: number) => void;
}

export const useMessStore = create<MessStore>((set) => ({
  // Initialize our 7 bachelors with some default starting data
  roommates: [
    { id: '1', name: 'Alex', meals: 60, spent: 150 },
    { id: '2', name: 'Ryan', meals: 60, spent: 0 },
    { id: '3', name: 'Sam', meals: 60, spent: 80 },
    { id: '4', name: 'Jordan', meals: 60, spent: 200 },
    { id: '5', name: 'Chris', meals: 60, spent: 50 },
    { id: '6', name: 'Liam', meals: 60, spent: 0 },
    { id: '7', name: 'Mason', meals: 60, spent: 120 },
  ],
  updateMeals: (id, meals) => set((state) => ({
    roommates: state.roommates.map(r => r.id === id ? { ...r, meals } : r)
  })),
  updateSpent: (id, spent) => set((state) => ({
    roommates: state.roommates.map(r => r.id === id ? { ...r, spent } : r)
  }))
}));