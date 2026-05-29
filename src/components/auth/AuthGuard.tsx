// ─────────────────────────────────────────────────────────────────────────
// AuthGuard — layout route that requires the user to be signed in.
// Unauthenticated visitors are redirected to /login with a `?redirect=`
// param so the login hook can send them back to their intended page.
//
// Usage:
//   <Route element={<AuthGuard />}>
//     <Route path="/account" element={<AccountPage />} />
//     <Route path="/account/orders" element={<OrdersPage />} />
//   </Route>
// ─────────────────────────────────────────────────────────────────────────
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
