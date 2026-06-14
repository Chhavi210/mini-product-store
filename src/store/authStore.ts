import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, AuthUser } from '@/types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user: AuthUser, token: string, refreshToken: string) =>
        set({ user, token, refreshToken }),

      clearAuth: () =>
        set({ user: null, token: null, refreshToken: null }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      // Only persist token/refreshToken; user is restored via /auth/me
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
