// ═══════════════════════════════════════════════════════════════
// auth.types.ts — request payloads + response shapes for /auth/*
// Mirrors backend src/interfaces/user.interface.ts.
// ═══════════════════════════════════════════════════════════════

export type UserRole = 'customer' | 'admin' | 'b2b_admin' | 'b2b_member' | 'partner'

/** Safe user shape returned by the backend (never contains secrets). */
export interface UserData {
  id: string
  email: string
  name: string
  phone: string
  role: UserRole
  b2bOrgId: string | null
  emailVerified: boolean
}

// ── Register ──
export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}
export interface RegisterResponseData {
  user: UserData
  accessToken: string
}

// ── Login ──
export interface LoginPayload {
  email: string
  password: string
}
export interface LoginResponseData {
  user: UserData
  accessToken: string
}

// ── Refresh ── (no payload; reads httpOnly cookie)
export interface RefreshResponseData {
  user: UserData
  accessToken: string
}

// ── Logout ── (no payload)
export type LogoutResponseData = null

// ── Get me ──
export interface GetMeResponseData {
  user: UserData
}

// ── Forgot password ──
export interface ForgotPasswordPayload {
  email: string
}
export type ForgotPasswordResponseData = null

// ── Reset password ──
export interface ResetPasswordPayload {
  token: string
  password: string
}
export type ResetPasswordResponseData = null
