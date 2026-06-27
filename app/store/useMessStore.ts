import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

const getToday = () => new Date().toISOString().split('T')[0];

type Roommate = { id: string; name: string; spent: number; };
export type MealOptions = { noon: boolean; night: boolean; hasGuest: boolean; guestNoon: boolean; guestNight: boolean; };
type DailyMeals = Record<string, Record<string, MealOptions>>;
export type PaymentLog = { id: string; roommate_id: string; amount: number; description: string; created_at: string; };

interface MessStore {
  roommates: Roommate[];
  dailyMeals: DailyMeals;
  payments: PaymentLog[];
  selectedDate: string;
  isLoaded: boolean;
  setSelectedDate: (date: string) => void;
  fetchData: () => Promise<void>;
  toggleMeal: (userId: string, field: keyof MealOptions) => Promise<void>;
  addPayment: (id: string, amount: number, note: string) => Promise<void>;
  addMember: (name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

const defaultMeals: MealOptions = { noon: true, night: true, hasGuest: false, guestNoon: false, guestNight: false };

export const calculateMeals = (meals?: MealOptions) => {
  if (!meals) return 2; 
  let total = (meals.noon ? 1 : 0) + (meals.night ? 1 : 0);
  if (meals.hasGuest) {
    total += (meals.guestNoon ? 1 : 0) + (meals.guestNight ? 1 : 0);
  }
  return total;
};

export const useMessStore = create<MessStore>((set, get) => ({
  roommates: [],
  dailyMeals: {}, 
  payments: [],
  selectedDate: getToday(),
  isLoaded: false, 
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  fetchData: async () => {
    const { data: roommatesData } = await supabase.from('roommates').select('*').order('id');
    const { data: mealsData } = await supabase.from('daily_meals').select('*');
    const { data: paymentsData } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });

    const formattedMeals: DailyMeals = {};
    if (mealsData) {
      mealsData.forEach((row) => {
        if (!formattedMeals[row.date]) formattedMeals[row.date] = {};
        formattedMeals[row.date][row.roommate_id] = {
          noon: row.noon,
          night: row.night,
          hasGuest: row.has_guest,
          guestNoon: row.guest_noon,
          guestNight: row.guest_night
        };
      });
    }

    set({ 
      roommates: roommatesData || [], 
      dailyMeals: formattedMeals,
      payments: paymentsData || [],
      isLoaded: true
    });
  },

  toggleMeal: async (userId: string, field: keyof MealOptions) => {
    // TODO: Add your toggle logic here
  },
  
  addPayment: async (id: string, amount: number, note: string) => {
    // TODO: Add your payment logic here
  },
  
  addMember: async (name: string) => {
    // TODO: Add your logic to add a member
  },
  
  deleteMember: async (id: string) => {
    // TODO: Add your logic to delete a member
  }
}));