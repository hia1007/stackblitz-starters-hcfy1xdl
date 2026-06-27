import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  profile: any | null; // This will hold your role and nickname
  isLoaded: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isLoaded: false,

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  fetchProfile: async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    set({ profile: data, isLoaded: true });
  }
}));