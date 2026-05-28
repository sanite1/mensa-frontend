import { post, get } from '../api'
import type { AuthUser } from '../stores/auth.store'

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; phone: string; password: string }
export interface LoginResponse { user: AuthUser; accessToken: string }

export const authApi = {
  login:          (body: LoginPayload) => post<LoginResponse>('/auth/login', body),
  register:       (body: RegisterPayload) => post<LoginResponse>('/auth/register', body),
  logout:         () => post<null>('/auth/logout'),
  me:             () => get<AuthUser>('/auth/me'),
  refresh:        () => post<{ accessToken: string }>('/auth/refresh'),
  forgotPassword: (email: string) => post<null>('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) => post<null>('/auth/reset-password', { token, password }),
}
