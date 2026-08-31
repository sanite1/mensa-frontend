import { getModule } from '@/lib/network/helpers/getModule'
import { PlatformRoutes } from '@/modules/platform/routes'
import { AdminRoutes } from '@/modules/admin/routes'
import { UnderConstructionPage } from '@/modules/platform/pages/UnderConstructionPage'

export default function App() {
  const module = getModule()

  if (module === 'admin') return <AdminRoutes />
  // Pre-launch, the apex domain holds a coming soon page while the real
  // storefront runs on app.mensaproducts.com (and localhost / previews).
  if (module === 'construction') return <UnderConstructionPage />
  return <PlatformRoutes />
}
