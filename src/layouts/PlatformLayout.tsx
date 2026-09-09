// PlatformLayout — main route shell for mensaproducts.com (customer surface).
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { captureReferralFromUrl } from '@/lib/referral'
import { clearStrayScrollLock } from '@/lib/useScrollLock'
import { useCartStore } from '@/lib/network/stores/cart.store'

export function PlatformLayout() {
  // Capture `?ref=CODE` on every navigation, a no op when the param is absent.
  const location = useLocation()
  useEffect(() => {
    captureReferralFromUrl()
  }, [location.search])

  // Close the cart and release any body lock an overlay left behind when it
  // closed and navigated in the same tick.
  const closeCart = useCartStore((s) => s.closeDrawer)
  useEffect(() => {
    closeCart()
    clearStrayScrollLock()
  }, [location.pathname, closeCart])

  return (
    <div className="flex flex-col min-h-dvh bg-(--paper)">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
