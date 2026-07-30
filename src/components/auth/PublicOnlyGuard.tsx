// PublicOnlyGuard — layout route that keeps already-signed-in users away.
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
