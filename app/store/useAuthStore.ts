import { create } from 'zustand';
// 🔄 FIX: Added an extra ../ to navigate out of app/store and into the root lib folder
import { supabase } from '../../lib/supabase';

interface AuthState {
  user: any;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  
  signInWithMagicLink: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // This ensures they are redirected back to your app after clicking the link in the email
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      }
    });
    return { error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));