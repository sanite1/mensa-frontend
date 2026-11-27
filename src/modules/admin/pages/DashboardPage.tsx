// /  (admin dashboard) in the design's Studio overview layout: KPI tiles,
// revenue chart, breakdowns, recent orders and low stock.
import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Mail,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'

import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useAdminReports, useAdminStats, type AdminRecentOrder } from '@/lib/network/api/admin.api'
import { formatNaira } from '@/lib/utils'
import {
  ACard,
  ago,
  Badge,
  ErrorNote,
  Money,
  PageHeader,
  Skeleton,
  Stat,
  type BadgeTone,
} from '@/modules/admin/components/ui'
import { RevenueChart, ShareBar } from '@/modules/admin/components/chart'

const RANGES = [7, 30, 90] as const

const CATEGORY_LABEL: Record<string, string> = {
  pants: 'Period pants',
  pads: 'Reusable pads',
  bundles: 'Bundles',
  education: 'Education',
  advocacy: 'Advocacy',
  other: 'Other',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  unknown: 'Unknown',
}

const PAYMENT_TONE: Record<AdminRecentOrder['paymentStatus'], BadgeTone> = {
  paid: 'green',
  pending: 'amber',
  failed: 'red',
  refunded: 'rose',
  partial_refund: 'rose',
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const statsQuery = useAdminStats()
  const reportsQuery = useAdminReports(days)
  if (!user) return null

  const stats = statsQuery.data?.data
  const reports = reportsQuery.data?.data

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Hi, ${user.name.split(' ')[0]}.`}
        lede="Here is the state of the shop right now. Numbers refresh every minute."
        actions={
          <div className="a-segment" role="group" aria-label="Period">
            {RANGES.map((d) => (
              <button
                key={d}
                type="button"
                className={days === d ? 'is-active' : ''}
                onClick={() => setDays(d)}
              >
                {d} days
              </button>
            ))}
          </div>
        }
      />
      <ErrorNote
        message={
          statsQuery.isError ? 'Could not load dashboard stats. Refresh to try again.' : undefined
        }
        onRetry={() => statsQuery.refetch()}
      />

      {/* Right now */}
      <div className="a-grid a-grid--stats mb-4">
        {stats ? (
          <>
            <Stat icon={<ReceiptText />} label="Today's orders" value={stats.todaysOrders} />
            <Stat
              icon={<Banknote />}
              label="Revenue (last 7 days)"
              value={formatNaira(stats.weekRevenueKobo)}
            />
            <Stat
              icon={<Truck />}
              label="Pending fulfilment"
              value={stats.pendingFulfilment}
              tone={stats.pendingFulfilment > 0 ? 'warn' : undefined}
            />
            <Stat
              icon={<AlertTriangle />}
              label="Low stock SKUs"
              value={stats.lowStockCount}
              tone={stats.lowStockCount > 0 ? 'bad' : undefined}
            />
            <Stat
              icon={<Mail />}
              label="Newsletter subscribers"
              value={stats.newsletterSubscribers}
              hint={
                stats.newsletterNewThisWeek > 0
                  ? `+${stats.newsletterNewThisWeek} this week`
                  : undefined
              }
            />
          </>
        ) : (
          <StatSkeletons n={5} />
        )}
      </div>

      {/* Selected period */}
      <div className="a-grid a-grid--stats mb-4">
        {reports ? (
          <>
            <Stat
              icon={<Banknote />}
              label={`Revenue (${days} days)`}
              value={formatNaira(reports.summary.windowRevenueKobo)}
            />
            <Stat
              icon={<ShoppingBag />}
              label={`Paid orders (${days} days)`}
              value={reports.summary.windowOrders}
            />
            <Stat
              icon={<Sparkles />}
              label="Avg order value (all time)"
              value={formatNaira(reports.summary.avgOrderValueKobo)}
            />
            <Stat
              icon={<Users />}
              label="Customers"
              value={reports.summary.totalCustomers}
              hint={`${formatNaira(reports.summary.totalRevenueKobo)} lifetime revenue`}
            />
          </>
        ) : (
          <StatSkeletons n={4} />
        )}
      </div>

      <div className="a-grid a-grid--main">
        <div className="a-stack">
          <ACard
            title="Revenue by day"
            actions={
              reports ? (
                <span className="a-muted a-num text-[12.5px]">
                  {formatNaira(reports.summary.windowRevenueKobo)} over {days} days
                </span>
              ) : null
            }
          >
            {reports ? (
              reports.revenueByDay.length ? (
                <RevenueChart data={reports.revenueByDay} />
              ) : (
                <p className="a-muted">No data.</p>
              )
            ) : (
              <Skeleton h={240} />
            )}
          </ACard>

          <div className="a-grid a-grid--2">
            <Breakdown
              title="Top products"
              loading={!reports}
              action={
                <Link className="a-card__link" to="/products">
                  Products <ArrowRight />
                </Link>
              }
              rows={(reports?.topProducts ?? []).map((p) => ({
                label: p.productName,
                sub: `${p.units} unit${p.units === 1 ? '' : 's'}`,
                value: p.revenueKobo,
                display: <Money kobo={p.revenueKobo} className="a-cell-main" />,
              }))}
            />
            <Breakdown
              title="Revenue by category"
              loading={!reports}
              rows={(reports?.categoryRevenue ?? []).map((c) => ({
                label: CATEGORY_LABEL[c.category] ?? c.category,
                value: c.revenueKobo,
                display: <Money kobo={c.revenueKobo} className="a-cell-main" />,
              }))}
            />
          </div>

          <ACard
            title="Recent orders"
            pad={false}
            actions={
              <Link className="a-card__link" to="/orders">
                See all <ArrowRight />
              </Link>
            }
          >
            <div className="a-tablewrap">
              {stats && stats.recentOrders.length === 0 ? (
                <p className="a-muted p-5">No orders yet.</p>
              ) : null}
              <table className="a-table">
                <tbody>
                  {stats?.recentOrders.map((o) => (
                    <tr
                      key={o._id}
                      className="is-link"
                      onClick={() => navigate(`/orders/${o._id}`)}
                    >
                      <td className="nowrap">
                        <Link to={`/orders/${o._id}`} className="a-cell-main a-mono">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="a-muted">{o.customerEmail}</td>
                      <td>
                        <Badge tone={PAYMENT_TONE[o.paymentStatus] ?? 'grey'}>
                          {o.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="a-muted nowrap a-hide-sm">{ago(o.createdAt)}</td>
                      <td className="r">
                        <Money kobo={o.totalKobo} className="a-cell-main" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!stats ? (
                <div className="p-5">
                  <Skeleton h={180} />
                </div>
              ) : null}
            </div>
          </ACard>
        </div>

        <div className="a-stack">
          <ACard
            title="Low stock"
            actions={
              <Link className="a-card__link" to="/products">
                Products <ArrowRight />
              </Link>
            }
          >
            {stats && stats.lowStock.length === 0 ? (
              <div className="a-empty">
                <div className="a-empty__icon">
                  <PackageCheck />
                </div>
                <h3>Nothing is below threshold.</h3>
              </div>
            ) : null}
            {!stats ? <Skeleton h={120} /> : null}
            <div className="a-list">
              {stats?.lowStock.map((i) => (
                <Link className="a-list__item" key={i.sku} to={`/products/${i.productSlug}/edit`}>
                  <div className="a-list__main">
                    <div className="a-cell-main">{i.productName}</div>
                    <div className="a-cell-sub">
                      {i.variantLabel} · <span className="a-mono">{i.sku}</span>
                    </div>
                  </div>
                  <Badge tone={i.stockCount <= 0 ? 'red' : 'amber'}>
                    {i.stockCount} of {i.lowStockThreshold}
                  </Badge>
                </Link>
              ))}
            </div>
          </ACard>

          <Breakdown
            title="Orders by status"
            loading={!reports}
            rows={(reports?.ordersByStatus ?? []).map((s) => ({
              label: STATUS_LABEL[s.status] ?? s.status,
              value: s.count,
              display: <span className="a-cell-main a-num">{s.count}</span>,
            }))}
          />
        </div>
      </div>
    </>
  )
}

function StatSkeletons({ n }: { n: number }) {
  return Array.from({ length: n }, (_, i) => (
    <div className="a-stat" key={i}>
      <Skeleton h={12} w="40%" />
      <Skeleton h={26} w="60%" />
      <Skeleton h={12} w="30%" />
    </div>
  ))
}

function Breakdown({
  title,
  rows,
  loading,
  action,
}: {
  title: string
  rows: { label: string; sub?: string; value: number; display: ReactNode }[]
  loading: boolean
  action?: ReactNode
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ACard title={title} actions={action}>
      {loading ? <Skeleton h={120} /> : null}
      {!loading && rows.length === 0 ? <p className="a-muted">No data for this period.</p> : null}
      <div className="a-list">
        {rows.map((r) => (
          <div className="a-list__item grid gap-1.5" key={r.label}>
            <div className="a-row flex-nowrap">
              <div className="a-list__main">
                <div className="a-cell-main">{r.label}</div>
                {r.sub ? <div className="a-cell-sub">{r.sub}</div> : null}
              </div>
              {r.display}
            </div>
            <ShareBar value={r.value} max={max} />
          </div>
        ))}
      </div>
    </ACard>
  )
}
