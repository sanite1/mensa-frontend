import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

// Pages — imported as they are built
const Home = () => <div style={{ padding: 40, fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--ink)' }}>Mensa — Platform</div>

export function PlatformRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Phase 2 */}
        {/* <Route path="/shop" element={<Shop />} /> */}
        {/* <Route path="/shop/:slug" element={<ProductDetail />} /> */}
        {/* <Route path="/cart" element={<Cart />} /> */}
        {/* Phase 3 */}
        {/* <Route path="/checkout" element={<Checkout />} /> */}
        {/* <Route path="/orders/:id" element={<OrderTracking />} /> */}
        {/* Phase 1 auth */}
        {/* <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} /> */}
        {/* <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} /> */}
        {/* Phase 5 content */}
        {/* <Route path="/journal" element={<Journal />} /> */}
        {/* <Route path="/education" element={<Education />} /> */}
        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/partnerships" element={<Partnerships />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
