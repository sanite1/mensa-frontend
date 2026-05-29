import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PublicOnlyGuard } from '@/components/auth/PublicOnlyGuard'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { AdminLayout } from '@/modules/admin/layouts/AdminLayout'
import { AdminAuthLayout } from '@/modules/admin/layouts/AdminAuthLayout'
import { AdminLoginPage } from '@/modules/admin/pages/auth/AdminLoginPage'
import { DashboardPage } from '@/modules/admin/pages/DashboardPage'
import { ProductsListPage } from '@/modules/admin/pages/products/ProductsListPage'
import { ProductFormPage } from '@/modules/admin/pages/products/ProductFormPage'

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

              {/* Sprint 2 — products CRUD */}
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/products/new" element={<ProductFormPage />} />
              <Route path="/products/:slug/edit" element={<ProductFormPage />} />
              {/* Sprint 3 — orders */}
              {/* <Route path="/orders" element={<OrdersPage />} /> */}
              {/* <Route path="/orders/:id" element={<OrderDetailPage />} /> */}
              {/* Sprint 4 — admin proper */}
              {/* <Route path="/customers" element={<CustomersPage />} /> */}
              {/* <Route path="/discounts" element={<DiscountsPage />} /> */}
              {/* <Route path="/content" element={<ContentPage />} /> */}
              {/* Sprint 6 — B2B */}
              {/* <Route path="/partnerships" element={<PartnershipsPage />} /> */}
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
