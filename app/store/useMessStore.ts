import { create } from 'zustand';

const getToday = () => new Date().toISOString().split('T')[0];

type Roommate = { id: string; name: string; spent: number; };
export type MealOptions = { noon: boolean; night: boolean; hasGuest: boolean; guestNoon: boolean; guestNight: boolean; };
type DailyMeals = Record<string, Record<string, MealOptions>>;

interface MessStore {
  roommates: Roommate[];
  dailyMeals: DailyMeals;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  toggleMeal: (userId: string, field: keyof MealOptions) => void;
  updateSpent: (id: string, spent: number) => void;
}

const defaultMeals: MealOptions = { noon: true, night: true, hasGuest: false, guestNoon: false, guestNight: false };

// Helper function to count the total checkboxes ticked
export const calculateMeals = (meals?: MealOptions) => {
  if (!meals) return 2; // Default is self Noon + Night
  let total = (meals.noon ? 1 : 0) + (meals.night ? 1 : 0);
  
  // Only count guest meals if the guest toggle is active
  if (meals.hasGuest) {
    total += (meals.guestNoon ? 1 : 0) + (meals.guestNight ? 1 : 0);
  }
  return total;
};

export const useMessStore = create<MessStore>((set) => ({
  roommates: [
    { id: '1', name: 'Alex', spent: 150 },
    { id: '2', name: 'Ryan', spent: 0 },
    { id: '3', name: 'Sam', spent: 80 },
    { id: '4', name: 'Jordan', spent: 200 },
    { id: '5', name: 'Chris', spent: 50 },
    { id: '6', name: 'Liam', spent: 0 },
    { id: '7', name: 'Mason', spent: 120 },
  ],
  dailyMeals: {}, 
  selectedDate: getToday(),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  toggleMeal: (userId, field) => set((state) => {
    const date = state.selectedDate;
    const currentDayLogs = state.dailyMeals[date] || {};
    const userMeals = currentDayLogs[userId] || { ...defaultMeals };
    
    const updatedMeals = { ...userMeals, [field]: !userMeals[field] };

    // Security check: If manager removes the guest, automatically uncheck the guest meals
    if (field === 'hasGuest' && updatedMeals.hasGuest === false) {
      updatedMeals.guestNoon = false;
      updatedMeals.guestNight = false;
    }
    
    return {
      dailyMeals: {
        ...state.dailyMeals,
        [date]: { 
          ...currentDayLogs, 
          [userId]: updatedMeals
        }
      }
    };
  }),
  
  updateSpent: (id, spent) => set((state) => ({
    roommates: state.roommates.map(r => r.id === id ? { ...r, spent } : r)
  }))
}));