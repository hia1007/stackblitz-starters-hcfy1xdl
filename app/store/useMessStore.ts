import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

const getToday = () => new Date().toISOString().split('T')[0];

export type Roommate = { id: string; name: string; spent: number; };
export type MealOptions = { noon: boolean; night: boolean; hasGuest: boolean; guestNoon: boolean; guestNight: boolean; };
export type DailyMeals = Record<string, Record<string, MealOptions>>;
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

export const defaultMeals: MealOptions = { noon: true, night: true, hasGuest: false, guestNoon: false, guestNight: false };

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
    const { selectedDate, dailyMeals } = get();
    const currentDateMeals = dailyMeals[selectedDate] || {};
    const userMeals = currentDateMeals[userId] || { ...defaultMeals };
    
    // Construct updated node
    const updatedUserMeals = { ...userMeals, [field]: !userMeals[field] };
    
    // Handle conditional resets for structural consistency
    if (field === 'hasGuest' && !updatedUserMeals.hasGuest) {
      updatedUserMeals.guestNoon = false;
      updatedUserMeals.guestNight = false;
    }

    // Optimistic UI state update
    set((state) => ({
      dailyMeals: {
        ...state.dailyMeals,
        [selectedDate]: {
          ...state.dailyMeals[selectedDate],
          [userId]: updatedUserMeals
        }
      }
    }));

    // Network Sync (Upsert based on compound key structure)
    const { error } = await supabase.from('daily_meals').upsert({
      date: selectedDate,
      roommate_id: userId,
      noon: updatedUserMeals.noon,
      night: updatedUserMeals.night,
      has_guest: updatedUserMeals.hasGuest,
      guest_noon: updatedUserMeals.guestNoon,
      guest_night: updatedUserMeals.guestNight
    }, { onConflict: 'date,roommate_id' });

    if (error) {
      console.error("Database update failed, rolling back state:", error);
      set({ dailyMeals }); // Rollback to original state context
    }
  },
  
  addPayment: async (roommateId: string, amount: number, note: string) => {
    // 1. Insert transaction entry into expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert([{ roommate_id: roommateId, amount, description: note }])
      .select();

    if (expenseError) throw expenseError;

    // 2. Synchronize current total spent fields safely
    const TargetRoommate = get().roommates.find(r => r.id === roommateId);
    const updatedSpent = (TargetRoommate?.spent || 0) + amount;

    const { error: roommateError } = await supabase
      .from('roommates')
      .update({ spent: updatedSpent })
      .eq('id', roommateId);

    if (roommateError) console.error("Roommate spent balance update failure:", roommateError);

    // 3. Update state seamlessly
    if (expenseData && expenseData.length > 0) {
      set((state) => ({
        payments: [expenseData[0], ...state.payments],
        roommates: state.roommates.map(r => r.id === roommateId ? { ...r, spent: updatedSpent } : r)
      }));
    }
  },
  
  addMember: async (name: string) => {
    const { data, error } = await supabase.from('roommates').insert([{ name, spent: 0 }]).select();
    if (error) return console.error("Error adding member:", error);
    if (data) set((state) => ({ roommates: [...state.roommates, data[0]] }));
  },
  
  deleteMember: async (id: string) => {
    const { error } = await supabase.from('roommates').delete().eq('id', id);
    if (error) return console.error("Error deleting member:", error);
    set((state) => ({ roommates: state.roommates.filter(r => r.id !== id) }));
  }
}));