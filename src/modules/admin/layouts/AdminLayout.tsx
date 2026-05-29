// ─────────────────────────────────────────────────────────────────────────
// AdminLayout — sidebar + topbar shell for the authenticated admin
// surface. Uses cream-soft for the main canvas to differentiate from the
// pure-paper platform surface.
// ─────────────────────────────────────────────────────────────────────────
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/modules/admin/components/Sidebar'
import { Topbar } from '@/modules/admin/components/Topbar'

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-cream-soft">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
