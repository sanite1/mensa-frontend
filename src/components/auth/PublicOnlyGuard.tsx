// ─────────────────────────────────────────────────────────────────────────
// PublicOnlyGuard — layout route that keeps already-signed-in users away
// from /login, /register, /forgot-password. Honors a `?redirect=` param
// so a logged-in user clicking a /login deep link goes to the right
// downstream page, not just /account.
// ─────────────────────────────────────────────────────────────────────────
import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useIsAuthenticated } from '@/lib/network/stores/auth.store'

export function PublicOnlyGuard() {
  const isAuthed = useIsAuthenticated()
  const [searchParams] = useSearchParams()

  if (isAuthed) {
    const redirect = searchParams.get('redirect')
    return <Navigate to={redirect || '/account'} replace />
  }

  return <Outlet />
}
