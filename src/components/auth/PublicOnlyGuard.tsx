// PublicOnlyGuard — layout route that keeps already-signed-in users away.
import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useIsAuthenticated } from '@/lib/network/stores/auth.store'
import { getModule } from '@/lib/network/helpers/getModule'

export function PublicOnlyGuard() {
  const isAuthed = useIsAuthenticated()
  const [searchParams] = useSearchParams()

  if (isAuthed) {
    const redirect = searchParams.get('redirect')
    // The admin console has no /account, its home is the dashboard.
    const home = getModule() === 'admin' ? '/' : '/account'
    return <Navigate to={redirect || home} replace />
  }

  return <Outlet />
}
