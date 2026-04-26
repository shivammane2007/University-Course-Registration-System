import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      role: null,

      setAuth: ({ user, token, refreshToken, role }) =>
        set({ user, token, refreshToken, role }),

      logout: () =>
        set({ user: null, token: null, refreshToken: null, role: null }),
    }),
    {
      name: 'ucrs-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        role: state.role,
      }),
    }
  )
);
