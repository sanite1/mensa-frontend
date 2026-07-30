// AdminAuthLayout — full bleed ink wrapper for the admin sign in page, no sidebar or topbar.
import { Outlet } from 'react-router-dom'

export function AdminAuthLayout() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <Outlet />
    </div>
  )
}
