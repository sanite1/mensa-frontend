import { getModule } from '@/lib/network/helpers/getModule'
import { PlatformRoutes } from '@/modules/platform/routes'
import { AdminRoutes } from '@/modules/admin/routes'

export default function App() {
  const module = getModule()

  if (module === 'admin') return <AdminRoutes />
  return <PlatformRoutes />
}
