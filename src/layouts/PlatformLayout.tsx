// PlatformLayout — main route shell for mensaproducts.com (customer surface).
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/chrome/Header'
import { Footer } from '@/components/chrome/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Sprite } from '@/components/design/Sprite'
import { Effects } from '@/components/design/Effects'
import { CurrencyPicker } from '@/components/chrome/CurrencyPicker'
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
      <Sprite />
      <div className="announce relative">
        Reusable period products, made in Abuja<b> · Nationwide delivery</b>
        {/* Converts display prices only, checkout still charges NGN. */}
        <div className="absolute right-(--gutter) top-1/2 hidden -translate-y-1/2 md:block">
          <CurrencyPicker tone="dark" />
        </div>
      </div>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Effects />
    </div>
  )
}
