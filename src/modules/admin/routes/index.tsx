import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PublicOnlyGuard } from '@/components/auth/PublicOnlyGuard'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { AdminLayout } from '@/modules/admin/layouts/AdminLayout'
import { AdminAuthLayout } from '@/modules/admin/layouts/AdminAuthLayout'
import { AdminLoginPage } from '@/modules/admin/pages/auth/AdminLoginPage'
import { DashboardPage } from '@/modules/admin/pages/DashboardPage'
import { ProfilePage } from '@/modules/admin/pages/ProfilePage'
import { ProductsListPage } from '@/modules/admin/pages/products/ProductsListPage'
import { ProductFormPage } from '@/modules/admin/pages/products/ProductFormPage'
import { OrdersListPage } from '@/modules/admin/pages/orders/OrdersListPage'
import { OrderDetailPage } from '@/modules/admin/pages/orders/OrderDetailPage'
import { DiscountsPage } from '@/modules/admin/pages/discounts/DiscountsPage'
import { CustomersListPage } from '@/modules/admin/pages/customers/CustomersListPage'
import { CustomerDetailPage } from '@/modules/admin/pages/customers/CustomerDetailPage'
import { ContentListPage } from '@/modules/admin/pages/content/ContentListPage'
import { ContentEditorPage } from '@/modules/admin/pages/content/ContentEditorPage'
import { NewsletterPage } from '@/modules/admin/pages/newsletter/NewsletterPage'
import { PartnershipsListPage } from '@/modules/admin/pages/partnerships/PartnershipsListPage'
import { PartnershipDetailPage } from '@/modules/admin/pages/partnerships/PartnershipDetailPage'
import { PartnerDetailPage } from '@/modules/admin/pages/partnerships/PartnerDetailPage'
import { NotFoundPage } from '@/modules/admin/pages/NotFoundPage'

export function AdminRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ─── Public auth ─────────────────────────────────────────────── */}
        <Route element={<PublicOnlyGuard />}>
          <Route element={<AdminAuthLayout />}>
            <Route path="/login" element={<AdminLoginPage />} />
          </Route>
        </Route>

        {/* ─── Authenticated, admin-only ──────────────────────────────── */}
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={['admin']} fallback="/login" />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Sprint 2 — products CRUD */}
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:slug/edit" element={<ProductFormPage />} />

              {/* Sprint 3 — orders */}
              <Route path="/orders" element={<OrdersListPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />

              {/* Sprint 4 — discounts */}
              <Route path="/discounts" element={<DiscountsPage />} />

              {/* Sprint 4 — customers */}
              <Route path="/customers" element={<CustomersListPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />

              {/* Sprint 4 — content */}
              <Route path="/content" element={<ContentListPage />} />
              <Route path="/content/new" element={<ContentEditorPage />} />
              <Route path="/content/:id/edit" element={<ContentEditorPage />} />

              {/* Sprint 5 — newsletter */}
              <Route path="/newsletter" element={<NewsletterPage />} />

              {/* Sprint 6 (MVP) — partnerships */}
              <Route path="/partnerships" element={<PartnershipsListPage />} />
              {/* Specific subpath BEFORE the catch-all org route. */}
              <Route path="/partnerships/individuals/:id" element={<PartnerDetailPage />} />
              <Route path="/partnerships/:id" element={<PartnershipDetailPage />} />

              {/* 404 catch-all (admins only — unauthed traffic redirected to /login by AuthGuard). */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
