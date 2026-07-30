// RoleGuard — layout route that restricts children to specified roles.
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import type { UserRole } from '@/lib/network/types/auth.types'

interface RoleGuardProps {
  allowed: UserRole[]
  /** Where to send users whose role isn't in `allowed`. Defaults to `/`. */
  fallback?: string
}

export function RoleGuard({ allowed, fallback = '/' }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user || !allowed.includes(user.role)) {
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
