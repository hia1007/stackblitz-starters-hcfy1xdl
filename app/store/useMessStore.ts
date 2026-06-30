import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

// FIXED: Calculate local time instead of UTC via toISOString()
const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// FIXED: Calculate local time instead of UTC via toISOString()
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

type Roommate = { 
  id: string; 
  name: string; 
  spent: number; 
  is_active: boolean; // Matches Supabase column
};
export type MealOptions = { noon: boolean; night: boolean; hasGuest: boolean; guestNoon: boolean; guestNight: boolean; is_edited: boolean; };
type DailyMeals = Record<string, Record<string, MealOptions>>;
export type PaymentLog = { id: string; roommate_id: string; amount: number; description: string; created_at: string; };

interface MessStore {
  roommates: Roommate[];
  dailyMeals: DailyMeals;
  payments: PaymentLog[];
  selectedDate: string;
  selectedMonth: string; 
  isLoaded: boolean;
  getActiveRoommates: () => Roommate[]; 
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void; 
  fetchData: () => Promise<void>;
  toggleMeal: (userId: string, field: keyof Omit<MealOptions, 'is_edited'>, isPastDate?: boolean) => Promise<void>;
  addPayment: (id: string, amount: number, note: string) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  addMember: (name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<boolean>; // Returns boolean for UI
}

export const defaultMeals: MealOptions = { noon: false, night: false, hasGuest: false, guestNoon: false, guestNight: false, is_edited: false };

export const calculateMeals = (meals?: MealOptions) => {
  if (!meals) return 0;
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
  selectedMonth: getCurrentMonth(), 
  isLoaded: false, 
  
  getActiveRoommates: () => {
    const { roommates } = get();
    return roommates.filter(r => r.is_active !== false); 
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedMonth: (month) => set({ selectedMonth: month }), 
  
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
          guestNight: row.guest_night,
          is_edited: row.is_edited || false
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

  toggleMeal: async (userId: string, field: keyof Omit<MealOptions, 'is_edited'>, isPastDate: boolean = false) => {
    const { selectedDate, dailyMeals } = get();
    const previousMeals = { ...dailyMeals }; 

    const currentDateMeals = dailyMeals[selectedDate] || {};
    const userMeals = currentDateMeals[userId] || { ...defaultMeals };
    
    const updatedUserMeals = { ...userMeals, [field]: !userMeals[field] };
    
    if (field === 'hasGuest' && !updatedUserMeals.hasGuest) {
      updatedUserMeals.guestNoon = false;
      updatedUserMeals.guestNight = false;
    }

    if (isPastDate) {
      updatedUserMeals.is_edited = true;
    }

    set((state) => ({
      dailyMeals: {
        ...state.dailyMeals,
        [selectedDate]: {
          ...state.dailyMeals[selectedDate],
          [userId]: updatedUserMeals
        }
      }
    }));

    const { data: existingMeal } = await supabase
      .from('daily_meals')
      .select('id')
      .eq('date', selectedDate)
      .eq('roommate_id', userId)
      .maybeSingle();

    if (existingMeal) {
      const { error } = await supabase
        .from('daily_meals')
        .update({
          noon: updatedUserMeals.noon,
          night: updatedUserMeals.night,
          has_guest: updatedUserMeals.hasGuest,
          guest_noon: updatedUserMeals.guestNoon,
          guest_night: updatedUserMeals.guestNight,
          is_edited: updatedUserMeals.is_edited
        })
        .eq('id', existingMeal.id);

      if (error) {
        console.error("Meal update failed:", error);
        alert(`Database Error: ${error.message}`);
        set({ dailyMeals: previousMeals }); 
      }
    } else {
      const { error } = await supabase
        .from('daily_meals')
        .insert([{
          id: crypto.randomUUID(),
          date: selectedDate,
          roommate_id: userId,
          noon: updatedUserMeals.noon,
          night: updatedUserMeals.night,
          has_guest: updatedUserMeals.hasGuest,
          guest_noon: updatedUserMeals.guestNoon,
          guest_night: updatedUserMeals.guestNight,
          is_edited: updatedUserMeals.is_edited
        }]);

      if (error) {
        console.error("Meal insert failed:", error);
        alert(`Database Error: ${error.message}`);
        set({ dailyMeals: previousMeals }); 
      }
    }
  },
  
  addPayment: async (id: string, amount: number, note: string) => {
    const newExpenseId = crypto.randomUUID();

    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert([{ id: newExpenseId, roommate_id: id, amount, description: note }])
      .select();

    if (expenseError) {
       console.error("Payment insert failed:", expenseError);
       throw expenseError; 
    }

    const targetRoommate = get().roommates.find(r => r.id === id);
    const updatedSpent = (targetRoommate?.spent || 0) + amount;

    const { error: roommateError } = await supabase
      .from('roommates')
      .update({ spent: updatedSpent })
      .eq('id', id);

    if (roommateError) console.error("Balance update failed:", roommateError);

    if (expenseData && expenseData.length > 0) {
      set((state) => ({
        payments: [expenseData[0], ...state.payments],
        roommates: state.roommates.map(r => r.id === id ? { ...r, spent: updatedSpent } : r)
      }));
    }
  },

  deletePayment: async (paymentId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', paymentId);
    if (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
      return;
    }
    set(state => ({
      payments: state.payments.filter(p => p.id !== paymentId)
    }));
  },
  
  addMember: async (name: string) => {
    const newRoommate = { id: crypto.randomUUID(), name, spent: 0, is_active: true };
    const { error } = await supabase.from('roommates').insert([newRoommate]);
    
    if (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member");
      return;
    }
    
    set(state => ({ roommates: [...state.roommates, newRoommate] }));
  },
  
  deleteMember: async (id: string) => {
    const { error } = await supabase
      .from('roommates')
      .update({ is_active: false }) 
      .eq('id', id);

    if (error) {
      console.error("Error archiving member:", error);
      alert(`Database Error: ${error.message}`);
      return false; // Tell UI it failed
    }

    set((state) => ({
      roommates: state.roommates.map(r => 
        r.id === id ? { ...r, is_active: false } : r
      )
    }));
    
    return true; // Tell UI it succeeded
  }
}));