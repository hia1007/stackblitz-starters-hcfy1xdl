import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthState {
  user: any;
  role: 'manager' | 'member' | null;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  promoteToManager: (email: string) => Promise<{ error: any }>;
  setUser?: (user: any) => void;
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

  promoteToManager: async (email: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'manager' })
      .eq('email', email);
    return { error };
  },

  signOut: async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
    set({ user: null, role: null });
  },

  setUser: (user) => set({ user }),
}));
