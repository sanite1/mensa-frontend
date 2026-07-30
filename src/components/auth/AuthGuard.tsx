// AuthGuard — layout route that requires the user to be signed in.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useIsAuthenticated } from '@/lib/network/stores/auth.store'

export function AuthGuard() {
  const isAuthed = useIsAuthenticated()
  const location = useLocation()

  if (!isAuthed) {
    const intended = location.pathname + location.search + location.hash
    const redirect = encodeURIComponent(intended)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
