import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'customer' | 'admin' | 'b2b_admin' | 'b2b_member'

export interface AuthUser {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  b2bOrgId?: string
  emailVerifiedAt?: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  login: (user: AuthUser, accessToken: string) => void
  logout: () => void
  setAccessToken: (token: string) => void
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'mensa-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
