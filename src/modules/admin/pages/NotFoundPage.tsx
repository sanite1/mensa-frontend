// Admin 404 — utility shell, no editorial flourish. Renders inside.

import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const location = useLocation()
  return (
    <section className="px-4 md:px-6 lg:px-8 py-12 lg:py-16">
      <div className="t-eyebrow text-mute mb-3">404</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
        That admin page does not exist.
      </h1>
      <p className="t-body mt-4 text-graphite max-w-130">
        We could not find <span className="font-mono text-ink">{location.pathname}</span>. Check the
        sidebar for what is available, or head back to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link to="/">Back to dashboard</Link>
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link to="/orders">Orders</Link>
        </Button>
      </div>
    </section>
  )
}
