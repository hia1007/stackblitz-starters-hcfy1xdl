import { create } from 'zustand';

interface AuthState {
  user: any;
  role: 'manager' | 'member' | null;
  signOut: () => Promise<void>;
  setUser?: (user: any) => void;
  verifySecretCode: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,

  verifySecretCode: (code: string) => {
    const secretCode = process.env.NEXT_PUBLIC_MANAGER_SECRET_CODE || '2022';
    if (code.trim() === secretCode) {
      // Grant manager access
      set({
        user: { id: 'manager-local', name: 'Manager' },
        role: 'manager'
      });
      return true;
    }
    return false;
  },

  signOut: async () => {
    set({ user: null, role: null });
  },

  setUser: (user) => set({ user }),
}));
