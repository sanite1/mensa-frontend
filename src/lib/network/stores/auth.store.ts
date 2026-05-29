import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserData, UserRole } from '../types/auth.types'

/** Alias kept for legacy imports; canonical shape lives in `auth.types.ts`. */
export type AuthUser = UserData
export type { UserRole }

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setAuth: (user: AuthUser, accessToken: string) => void
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'mensa-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)

/** Selector hook — true when both user and access token are set. */
export const useIsAuthenticated = () =>
  useAuthStore((s) => !!s.user && !!s.accessToken)
