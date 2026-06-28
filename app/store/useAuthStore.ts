import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

interface AuthState {
  user: any;
  role: 'manager' | 'member' | null;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  promoteToManager: (email: string) => Promise<{ error: any }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (data) set({ role: data.role });
  },

  signInWithMagicLink: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      }
    });
    return { error };
  },

  promoteToManager: async (email: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'manager' })
      .eq('email', email);
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },
}));