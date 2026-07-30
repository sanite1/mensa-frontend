// AdminLayout — sidebar + topbar shell. Mobile menu state lives here because Topbar and Sidebar both read and write it.
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/modules/admin/components/Sidebar'
import { Topbar } from '@/modules/admin/components/Topbar'

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Close the drawer on route change so it does not sit open over the new page.
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll + listen for Escape while the drawer is open.
  useEffect(() => {
    if (!isMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handler)
    }
  }, [isMenuOpen])

  return (
    <div className="flex h-screen bg-cream-soft">
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
