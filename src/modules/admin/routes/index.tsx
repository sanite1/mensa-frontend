import { BrowserRouter, Routes, Route } from 'react-router-dom'

const AdminHome = () => (
  <div style={{ padding: 40, fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--ink)' }}>
    Mensa — Admin
  </div>
)

export function AdminRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        {/* Phase 1 */}
        {/* <Route path="/login" element={<AdminLogin />} /> */}
        {/* Phase 4 */}
        {/* <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} /> */}
        {/* <Route path="/orders" element={<ProtectedRoute roles={['admin']}><Orders /></ProtectedRoute>} /> */}
        {/* <Route path="/products" element={<ProtectedRoute roles={['admin']}><Products /></ProtectedRoute>} /> */}
      </Routes>
    </BrowserRouter>
  )
}
