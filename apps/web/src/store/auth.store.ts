import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@handycraft/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // Actions
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth(user, accessToken) {
        set({ user, accessToken, isAuthenticated: true });
      },

      logout() {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      updateUser(partial) {
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null }));
      },
    }),
    {
      name: 'handycraft-auth',
      // Only persist user info — access token lives in httpOnly cookie, this is UI state
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
