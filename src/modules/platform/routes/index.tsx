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
import { AddressesPage } from '@/modules/platform/pages/account/AddressesPage'
import { AboutPage } from '@/modules/platform/pages/AboutPage'
import { PartnershipsPage } from '@/modules/platform/pages/PartnershipsPage'
import { ContactPage } from '@/modules/platform/pages/ContactPage'
import { ReturnsPage } from '@/modules/platform/pages/ReturnsPage'
import { NotFoundPage } from '@/modules/platform/pages/NotFoundPage'
import { EducationIndexPage } from '@/modules/platform/pages/education/EducationIndexPage'
import { EducationPostPage } from '@/modules/platform/pages/education/EducationPostPage'
import { PrivacyPage } from '@/modules/platform/pages/legal/PrivacyPage'
import { TermsPage } from '@/modules/platform/pages/legal/TermsPage'
import { JournalIndexPage } from '@/modules/platform/pages/journal/JournalIndexPage'
import { JournalPostPage } from '@/modules/platform/pages/journal/JournalPostPage'
import { PartnerOnboardingPage } from '@/modules/platform/pages/partner/PartnerOnboardingPage'
import { PartnerDashboardPage } from '@/modules/platform/pages/partner/PartnerDashboardPage'
import { RoleGuard } from '@/components/auth/RoleGuard'
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
            <Route path="/account/addresses" element={<AddressesPage />} />
            {/* Sprint 4 adds these:
              <Route path="/account/preferences" element={<PreferencesPage />} />
            */}
          </Route>

          {/* Phase 2 — Product layer */}
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:slug" element={<ProductDetailPage />} />

          {/* Editorial / brand pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/partnerships" element={<PartnershipsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/journal" element={<JournalIndexPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/education" element={<EducationIndexPage />} />
          <Route path="/education/:slug" element={<EducationPostPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Partner onboarding (token-gated public) */}
          <Route path="/partner/onboarding" element={<PartnerOnboardingPage />} />

          {/* Partner dashboard (auth + role gate) */}
          <Route element={<AuthGuard />}>
            <Route element={<RoleGuard allowed={['partner']} />}>
              <Route path="/partner" element={<PartnerDashboardPage />} />
            </Route>
          </Route>

          {/* Phase 3 — Checkout (guest-friendly, no auth guard) */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmation/:orderNumber"
            element={<ConfirmationPage />}
          />
          <Route path="/orders/track" element={<TrackOrderPage />} />

          {/* 404 catch-all — must be last so it only matches unrouted paths. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
