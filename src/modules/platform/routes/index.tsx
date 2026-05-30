import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PublicOnlyGuard } from '@/components/auth/PublicOnlyGuard'
import { PlatformLayout } from '@/layouts/PlatformLayout'
import { HomePage } from '@/modules/platform/pages/HomePage'
import { LoginPage } from '@/modules/platform/pages/auth/LoginPage'
import { RegisterPage } from '@/modules/platform/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/modules/platform/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/platform/pages/auth/ResetPasswordPage'
import { AccountPage } from '@/modules/platform/pages/account/AccountPage'
import { OrdersPage } from '@/modules/platform/pages/account/OrdersPage'
import { OrderDetailPage } from '@/modules/platform/pages/account/OrderDetailPage'
import { ShopPage } from '@/modules/platform/pages/shop/ShopPage'
import { ProductDetailPage } from '@/modules/platform/pages/shop/ProductDetailPage'
import { CheckoutPage } from '@/modules/platform/pages/checkout/CheckoutPage'
import { ConfirmationPage } from '@/modules/platform/pages/checkout/ConfirmationPage'
import { TrackOrderPage } from '@/modules/platform/pages/orders/TrackOrderPage'

export function PlatformRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PlatformLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* ─── Public-only auth (redirect to /account if already signed in) ── */}
          <Route element={<PublicOnlyGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Reset password is unguarded — the URL token is the auth check,
              and a signed-in user clicking an email link should still be
              able to set a new password. */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ─── Authenticated routes ─────────────────────────────────────── */}
          <Route element={<AuthGuard />}>
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/orders" element={<OrdersPage />} />
            <Route path="/account/orders/:id" element={<OrderDetailPage />} />
            {/* Sprint 4 adds these:
              <Route path="/account/addresses" element={<AddressesPage />} />
              <Route path="/account/preferences" element={<PreferencesPage />} />
            */}
          </Route>

          {/* Phase 2 — Product layer */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />

          {/* Phase 3 — Checkout (guest-friendly, no auth guard) */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmation/:orderNumber"
            element={<ConfirmationPage />}
          />
          <Route path="/orders/track" element={<TrackOrderPage />} />
          {/* Phase 5 — Content */}
          {/* <Route path="/journal" element={<Journal />} /> */}
          {/* <Route path="/education" element={<Education />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/partnerships" element={<Partnerships />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
