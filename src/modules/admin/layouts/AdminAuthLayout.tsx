// ─────────────────────────────────────────────────────────────────────────
// AdminAuthLayout — full-bleed wrapper for the admin sign-in page. No
// sidebar / topbar. Ink background to set tonal expectation that this
// surface is the admin tool.
// ─────────────────────────────────────────────────────────────────────────
import { Outlet } from 'react-router-dom'

export function AdminAuthLayout() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <Outlet />
    </div>
  )
}
