import { create } from 'zustand';
import { supabase } from '../../lib/supabase'; // Using your fixed path!

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
    // Fetch payment history, newest first
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
  
  toggleMeal: async (userId, field) => {
    const state = get();
    const date = state.selectedDate;
    const currentDayLogs = state.dailyMeals[date] || {};
    const userMeals = currentDayLogs[userId] || { ...defaultMeals };
    
    const updatedMeals = { ...userMeals, [field]: !userMeals[field] };

    if (field === 'hasGuest' && updatedMeals.hasGuest === false) {
      updatedMeals.guestNoon = false;
      updatedMeals.guestNight = false;
    }
    
    set({
      dailyMeals: { ...state.dailyMeals, [date]: { ...currentDayLogs, [userId]: updatedMeals } }
    });

    await supabase.from('daily_meals').upsert({
      date: date,
      roommate_id: userId,
      noon: updatedMeals.noon,
      night: updatedMeals.night,
      has_guest: updatedMeals.hasGuest,
      guest_noon: updatedMeals.guestNoon,
      guest_night: updatedMeals.guestNight
    }, { onConflict: 'date, roommate_id' });
  },
  
  // POST PAYMENT LOGIC
  addPayment: async (id, amount, note) => {
    const state = get();
    
    const roommate = state.roommates.find(r => r.id === id);
    if (!roommate) return;
    
    // Auto-update balance
    const newTotalSpent = roommate.spent + amount;

    // Save transaction permanently
    const { data: newPayment } = await supabase.from('expenses').insert({
      roommate_id: id,
      amount: amount,
      description: note
    }).select().single();

    if (!newPayment) return;

    // Update local state instantly
    set({
      payments: [newPayment, ...state.payments],
      roommates: state.roommates.map(r => r.id === id ? { ...r, spent: newTotalSpent } : r)
    });

    // Push new balance to DB
    await supabase.from('roommates').update({ spent: newTotalSpent }).eq('id', id);
  }
}));