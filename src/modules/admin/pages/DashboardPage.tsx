// /  (admin dashboard).
import { Link } from 'react-router-dom'
import { ArrowRight, AlertTriangle } from 'lucide-react'

import { useAuthStore } from '@/lib/network/stores/auth.store'
import {
  useAdminStats,
  type AdminLowStockEntry,
  type AdminRecentOrder,
} from '@/lib/network/api/admin.api'
import { formatNaira } from '@/lib/utils'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const query = useAdminStats()
  if (!user) return null

  const stats = query.data?.data
  const loading = query.isLoading
  const errored = query.isError

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-300">
      <div className="t-eyebrow text-mute mb-3">Dashboard</div>
      <h1 className="m-0 font-display italic font-semibold text-[clamp(36px,6vw,56px)] leading-[1.02] tracking-tight text-ink">
        Hi, {user.name.split(' ')[0]}.
      </h1>
      <p className="t-body-l mt-3 text-graphite max-w-140">
        Here is the state of the shop right now. Numbers refresh every minute.
      </p>

      <div className="mt-8 md:mt-10 grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <KpiCard
          label="Today's orders"
          value={loading ? '…' : String(stats?.todaysOrders ?? 0)}
        />
        <KpiCard
          label="Revenue (last 7 days)"
          value={loading ? '…' : formatNaira(stats?.weekRevenueKobo ?? 0)}
        />
        <KpiCard
          label="Pending fulfilment"
          value={loading ? '…' : String(stats?.pendingFulfilment ?? 0)}
          href={stats && stats.pendingFulfilment > 0 ? '/orders' : undefined}
        />
        <KpiCard
          label="Low stock SKUs"
          value={loading ? '…' : String(stats?.lowStockCount ?? 0)}
          tone={stats && stats.lowStockCount > 0 ? 'warn' : undefined}
        />
        <KpiCard
          label="Newsletter subscribers"
          value={loading ? '…' : String(stats?.newsletterSubscribers ?? 0)}
          sub={
            stats && stats.newsletterNewThisWeek > 0
              ? `+${stats.newsletterNewThisWeek} this week`
              : undefined
          }
          href="/newsletter"
        />
      </div>

      {errored ? (
        <div className="mt-8 border border-hairline-soft bg-blush p-4 t-body-s text-berry">
          Could not load dashboard stats. Refresh to try again.
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={stats?.recentOrders ?? []} loading={loading} />
        </div>
        <LowStockCard items={stats?.lowStock ?? []} loading={loading} />
      </div>
    </section>
  )
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  href,
  tone,
  sub,
}: {
  label: string
  value: string
  href?: string
  tone?: 'warn'
  sub?: string
}) {
  const inner = (
    <div
      className={
        'border border-hairline-soft bg-paper p-4 md:p-5 h-full flex flex-col gap-2 ' +
        (tone === 'warn' ? 'border-coral/60' : '')
      }
    >
      <div className="t-eyebrow text-mute text-[10.5px]">{label}</div>
      <div className="text-ink font-display italic font-semibold text-[clamp(28px,4vw,36px)] leading-none tracking-tight">
        {value}
      </div>
      {sub ? (
        <div className="text-[11px] uppercase tracking-widest font-medium text-ok font-mono">
          {sub}
        </div>
      ) : null}
      {href ? (
        <div className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium text-pink-deep">
          View <ArrowRight size={12} strokeWidth={2} />
        </div>
      ) : null}
    </div>
  )
  if (href) {
    return (
      <Link to={href} className="block no-underline">
        {inner}
      </Link>
    )
  }
  return inner
}

// ── Recent orders strip ───────────────────────────────────────────
function RecentOrdersCard({
  orders,
  loading,
}: {
  orders: AdminRecentOrder[]
  loading: boolean
}) {
  return (
    <div className="border border-hairline-soft bg-paper">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-hairline-soft">
        <div className="t-eyebrow text-mute">Recent orders</div>
        <Link
          to="/orders"
          className="text-[11px] uppercase tracking-widest font-medium text-ink underline underline-offset-4 hover:text-pink-deep"
        >
          See all
        </Link>
      </div>
      {loading ? (
        <div className="p-6 t-body-s text-mute">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="p-6 t-body-s text-mute">No orders yet.</div>
      ) : (
        <ul className="divide-y divide-hairline-soft">
          {orders.map((o: AdminRecentOrder) => (
            <li key={o._id}>
              <Link
                to={`/orders/${o._id}`}
                className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 hover:bg-cream-soft no-underline"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-mono text-ink">{o.orderNumber}</div>
                  <div className="t-body-s text-mute truncate">{o.customerEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] text-ink font-medium">
                    {formatNaira(o.totalKobo)}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest font-medium text-mute">
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PaymentBadge({ status }: { status: AdminRecentOrder['paymentStatus'] }) {
  const tone =
    status === 'paid'
      ? 'text-ok'
      : status === 'failed'
        ? 'text-err'
        : status === 'pending'
          ? 'text-mute'
          : 'text-graphite'
  return <span className={tone}>{status}</span>
}

// ── Low stock card ────────────────────────────────────────────────
function LowStockCard({
  items,
  loading,
}: {
  items: AdminLowStockEntry[]
  loading: boolean
}) {
  return (
    <div className="border border-hairline-soft bg-paper">
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 border-b border-hairline-soft">
        <div className="t-eyebrow text-mute inline-flex items-center gap-2">
          {items.length > 0 ? <AlertTriangle size={14} className="text-coral" /> : null}
          Low stock
        </div>
        <Link
          to="/products"
          className="text-[11px] uppercase tracking-widest font-medium text-ink underline underline-offset-4 hover:text-pink-deep"
        >
          Products
        </Link>
      </div>
      {loading ? (
        <div className="p-6 t-body-s text-mute">Loading…</div>
      ) : items.length === 0 ? (
        <div className="p-6 t-body-s text-mute">Nothing is below threshold.</div>
      ) : (
        <ul className="divide-y divide-hairline-soft">
          {items.map((i: AdminLowStockEntry) => (
            <li key={i.sku}>
              <Link
                to={`/products/${i.productSlug}/edit`}
                className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 hover:bg-cream-soft no-underline"
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-ink truncate">{i.productName}</div>
                  <div className="text-[11px] font-mono text-mute truncate">
                    {i.sku} · {i.variantLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-medium text-coral">{i.stockCount}</div>
                  <div className="text-[10px] uppercase tracking-widest font-medium text-mute">
                    of {i.lowStockThreshold}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
