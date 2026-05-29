// ─────────────────────────────────────────────────────────────────────────
// PlatformLayout — main route shell for mensaproducts.com (customer surface).
// Wraps Header + page <Outlet/> + Footer + the global CartDrawer.
// ─────────────────────────────────────────────────────────────────────────
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function PlatformLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--paper)]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
