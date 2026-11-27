// AdminLayout: the design's Studio frame (a-root, a-app). Dark sidebar on
// desktop, a drawer with a scrim and a slim top bar under 960px.
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import { Sidebar } from '@/modules/admin/components/Sidebar'
import { clearStrayScrollLock, useScrollLock } from '@/lib/useScrollLock'
import { cn } from '@/lib/utils'
import logo from '@/assets/mensa_logo.png'

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
    <div className="a-root">
      <div className={cn('a-app', isMenuOpen && 'is-menu-open')}>
        <Sidebar onClose={() => setIsMenuOpen(false)} />
        <div className="a-scrim" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
        <div className="a-main">
          <div className="a-topbar">
            <button
              type="button"
              className="a-iconbtn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>
            <img src={logo} alt="Mensa" width={78} />
            <Link to="/profile" className="a-iconbtn" aria-label="Profile">
              <User />
            </Link>
          </div>
          {/* Keyed by path so the design's a-in entrance plays on every page. */}
          <main key={location.pathname} className="a-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
