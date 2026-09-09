// AdminLayout — sidebar + topbar shell. Mobile menu state lives here because Topbar and Sidebar both read and write it.
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/modules/admin/components/Sidebar'
import { Topbar } from '@/modules/admin/components/Topbar'
import { clearStrayScrollLock, useScrollLock } from '@/lib/useScrollLock'

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Close the drawer on route change so it does not sit open over the new page,
  // and release any body lock a closing overlay left behind.
  useEffect(() => {
    setIsMenuOpen(false)
    clearStrayScrollLock()
  }, [location.pathname])

  useScrollLock(isMenuOpen)

  // Escape closes the drawer.
  useEffect(() => {
    if (!isMenuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isMenuOpen])

  return (
    // h-dvh, not h-screen: on mobile Safari 100vh runs under the browser
    // chrome, which left dark bands above and below the drawer backdrop.
    <div className="flex h-dvh bg-cream-soft">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setIsMenuOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
