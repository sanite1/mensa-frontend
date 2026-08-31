// auth.api.ts — raw async functions + React Query hooks.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../api'
import { getModule } from '../helpers/getModule'
import { buildAppUrl } from '../helpers/buildAppUrl'
import { handleApiError } from '../helpers/handleApiError'
import { useAuthStore, useIsAuthenticated } from '../stores/auth.store'
import type { ApiResponse } from '../api'
import type {
  RegisterPayload,
  RegisterResponseData,
  LoginPayload,
  LoginResponseData,
  RefreshResponseData,
  LogoutResponseData,
  GetMeResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
  ResetPasswordPayload,
  ResetPasswordResponseData,
} from '../types/auth.types'

// ── Query keys (centralised for cache invalidation) ──
export const authKeys = {
  me: ['auth', 'me'] as const,
}

// ─── 1. POST /api/v1/auth/register ───────────────

const registerFn = async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
  return api.post<RegisterResponseData>('/auth/register', payload)
}

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: registerFn,
    onSuccess: (res) => {
      if (res.data) {
        setAuth(res.data.user, res.data.accessToken)
      }
      toast.success(res.message)
      navigate('/account')
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 2. POST /api/v1/auth/login ──────────────────

const loginFn = async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
  return api.post<LoginResponseData>('/auth/login', payload)
}

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginFn,
    onSuccess: (res) => {
      if (!res.data) return
      const { user, accessToken } = res.data
      const surface = getModule()

      // ── Admin surface: only admins allowed in ─────────────────────────
      if (surface === 'admin') {
        if (user.role !== 'admin') {
          toast.error(
            "This account doesn't have admin access. Sign in at mensaproducts.com instead.",
          )
          return
        }
        setAuth(user, accessToken)
        toast.success('Welcome back.')
        const params = new URLSearchParams(window.location.search)
        navigate(params.get('redirect') || '/')
        return
      }

      // ── Platform surface: customer/b2b stay; admins hop to admin URL ──
      setAuth(user, accessToken)
      toast.success('Welcome back.')

      if (user.role === 'admin') {
        // buildAppUrl knows the right admin origin per environment, the old
        // VITE_ADMIN_URL fallback pointed at a stale port.
        window.location.href = buildAppUrl('admin')
        return
      }

      const params = new URLSearchParams(window.location.search)
      navigate(params.get('redirect') || '/account')
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 3. POST /api/v1/auth/refresh ────────────────

const refreshFn = async (): Promise<ApiResponse<RefreshResponseData>> => {
  return api.post<RefreshResponseData>('/auth/refresh')
}

export const useRefresh = () => {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: refreshFn,
    onSuccess: (res) => {
      if (res.data) setAuth(res.data.user, res.data.accessToken)
    },
    onError: () => {
      useAuthStore.getState().logout()
    },
  })
}

// ─── 4. POST /api/v1/auth/logout (authenticated) ────

const logoutFn = async (): Promise<ApiResponse<LogoutResponseData>> => {
  return api.post<LogoutResponseData>('/auth/logout')
}

export const useLogout = () => {
  const storeLogout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Admin sees /login after sign-out (the only public page). Platform users
  // are sent home — they can keep browsing as a guest.
  const postLogoutPath = () => (getModule() === 'admin' ? '/login' : '/')

  return useMutation({
    mutationFn: logoutFn,
    onSuccess: (res) => {
      storeLogout()
      queryClient.clear()
      toast.success(res.message)
      navigate(postLogoutPath())
    },
    onError: (error) => {
      // Even if the backend call fails, clear local state so the user is
      // signed out from the UI's perspective.
      storeLogout()
      queryClient.clear()
      toast.error(handleApiError(error).message)
      navigate(postLogoutPath())
    },
  })
}

// ─── 5. GET /api/v1/auth/me (authenticated) ──────

const getMeFn = async (): Promise<ApiResponse<GetMeResponseData>> => {
  return api.get<GetMeResponseData>('/auth/me')
}

export const useGetMe = () => {
  const isAuthenticated = useIsAuthenticated()
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await getMeFn()
      // Keep the persisted store fresh with the canonical server-side user.
      if (res.data?.user) setUser(res.data.user)
      return res
    },
    enabled: isAuthenticated,
  })
}

// ─── 6. POST /api/v1/auth/forgot-password ────────

const forgotPasswordFn = async (
  payload: ForgotPasswordPayload,
): Promise<ApiResponse<ForgotPasswordResponseData>> => {
  return api.post<ForgotPasswordResponseData>('/auth/forgot-password', payload)
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordFn,
    onSuccess: (res) => {
      toast.success(res.message)
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 7. POST /api/v1/auth/reset-password ─────────

const resetPasswordFn = async (
  payload: ResetPasswordPayload,
): Promise<ApiResponse<ResetPasswordResponseData>> => {
  return api.post<ResetPasswordResponseData>('/auth/reset-password', payload)
}

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: resetPasswordFn,
    onSuccess: (res) => {
      toast.success(res.message)
      navigate('/login')
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}
