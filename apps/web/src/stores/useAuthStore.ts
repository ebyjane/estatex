import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { persistWebStorage } from '@/lib/persistWebStorage';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  /** False until persist rehydration + token/session validation finished (see AuthHydrator). */
  sessionChecked: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  markSessionChecked: () => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist<AuthState, [], [], Pick<AuthState, 'user'>>(
    (set) => ({
      user: null,
      sessionChecked: false,
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') localStorage.setItem('token', token.trim());
        set({ user, sessionChecked: true });
      },
      setUser: (user) => set({ user }),
      markSessionChecked: () => set({ sessionChecked: true }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ user: null, sessionChecked: true });
      },
    }),
    {
      name: 'estatex-auth-v1',
      storage: persistWebStorage as PersistStorage<Pick<AuthState, 'user'>>,
      partialize: (s) => ({ user: s.user }),
      skipHydration: true,
    },
  ),
);
