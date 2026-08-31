// Dashboard reports — revenue trend, status/product/category breakdowns.
// Charts are plain SVG/HTML: single brand hue, thin marks, direct value
// labels everywhere so identity never rides on color alone.
import { useMemo, useState } from 'react'

import { useAdminReports, type AdminReportDay } from '@/lib/network/api/admin.api'
import { formatNaira, cn } from '@/lib/utils'

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

export function ReportsSection() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const query = useAdminReports(days)
  const reports = query.data?.data
  const loading = query.isLoading

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="t-eyebrow text-mute">Reports</div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDays(r)}
              className={cn(
                'px-3 py-1.5 text-[11px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                days === r ? 'bg-ink text-paper' : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SummaryTile
          label={`Revenue (${days} days)`}
          value={loading ? '…' : formatNaira(reports?.summary.windowRevenueKobo ?? 0)}
        />
        <SummaryTile
          label={`Paid orders (${days} days)`}
          value={loading ? '…' : String(reports?.summary.windowOrders ?? 0)}
        />
        <SummaryTile
          label="Avg order value (all time)"
          value={loading ? '…' : formatNaira(reports?.summary.avgOrderValueKobo ?? 0)}
        />
        <SummaryTile
          label="Customers"
          value={loading ? '…' : String(reports?.summary.totalCustomers ?? 0)}
          sub={
            reports
              ? `${formatNaira(reports.summary.totalRevenueKobo)} lifetime revenue`
              : undefined
          }
        />
      </div>

      {/* Revenue trend */}
      <div className="mt-4 md:mt-6 border border-hairline-soft bg-paper p-4 md:p-5">
        <div className="t-eyebrow text-mute mb-4">Revenue by day</div>
        {loading ? (
          <div className="h-55 flex items-center justify-center t-body-s text-mute">Loading…</div>
        ) : (
          <RevenueChart data={reports?.revenueByDay ?? []} />
        )}
      </div>

      {/* Breakdowns */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <BreakdownCard
          title="Top products"
          loading={loading}
          rows={(reports?.topProducts ?? []).map((p) => ({
            label: p.productName,
            sublabel: `${p.units} unit${p.units === 1 ? '' : 's'}`,
            value: p.revenueKobo,
            display: formatNaira(p.revenueKobo),
          }))}
        />
        <BreakdownCard
          title="Revenue by category"
          loading={loading}
          rows={(reports?.categoryRevenue ?? []).map((c) => ({
            label: CATEGORY_LABEL[c.category] ?? c.category,
            value: c.revenueKobo,
            display: formatNaira(c.revenueKobo),
          }))}
        />
        <BreakdownCard
          title="Orders by status"
          loading={loading}
          rows={(reports?.ordersByStatus ?? []).map((s) => ({
            label: STATUS_LABEL[s.status] ?? s.status,
            value: s.count,
            display: String(s.count),
          }))}
        />
      </div>
    </div>
  )
}

function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-hairline-soft bg-paper p-4 md:p-5 flex flex-col gap-2">
      <div className="t-eyebrow text-mute text-[10.5px]">{label}</div>
      <div className="text-ink font-display italic font-semibold text-[clamp(24px,3vw,32px)] leading-none tracking-tight">
        {value}
      </div>
      {sub ? <div className="text-[11.5px] text-mute">{sub}</div> : null}
    </div>
  )
}

// ── Revenue line chart (SVG, hover tooltip) ───────────────────────

const W = 900
const H = 220
const PAD = { top: 12, right: 12, bottom: 24, left: 12 }

function RevenueChart({ data }: { data: AdminReportDay[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const { points, areaPath, linePath, maxRevenue } = useMemo(() => {
    const max = Math.max(1, ...data.map((d) => d.revenueKobo))
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const pts = data.map((d, i) => ({
      x: PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: PAD.top + innerH - (d.revenueKobo / max) * innerH,
      d,
    }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    const area =
      pts.length > 0
        ? [
            `M${pts[0].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)}`,
            ...pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
            `L${pts[pts.length - 1].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)}Z`,
          ]
        : []
    return {
      points: pts,
      areaPath: area.join(' '),
      linePath: line.join(' '),
      maxRevenue: max,
    }
  }, [data])

  if (data.length === 0) {
    return <div className="h-55 flex items-center justify-center t-body-s text-mute">No data.</div>
  }

  const active = hover != null ? points[hover] : null
  const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let nearest = 0
    let best = Infinity
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - x)
      if (dist < best) {
        best = dist
        nearest = i
      }
    }
    setHover(nearest)
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        role="img"
        aria-label="Revenue per day"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Recessive gridlines at 0 / 50 / 100 percent of max */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - t)
          return (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--hairline-soft)"
              strokeWidth={1}
            />
          )
        })}

        <path d={areaPath} fill="var(--pink)" opacity={0.14} />
        <path d={linePath} fill="none" stroke="var(--pink)" strokeWidth={2} />

        {/* Hover crosshair + marker */}
        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="var(--mute)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={4.5}
              fill="var(--pink)"
              stroke="var(--paper)"
              strokeWidth={2}
            />
          </>
        ) : null}

        {/* First and last date labels */}
        <text x={PAD.left} y={H - 6} fontSize={11} fill="var(--mute)" fontFamily="var(--font-mono)">
          {shortDate(data[0].date)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          fontSize={11}
          fill="var(--mute)"
          textAnchor="end"
          fontFamily="var(--font-mono)"
        >
          {shortDate(data[data.length - 1].date)}
        </text>
        {/* Max value label on the top gridline */}
        <text x={PAD.left} y={PAD.top - 2} fontSize={11} fill="var(--mute)">
          {formatNaira(maxRevenue)}
        </text>
      </svg>

      {active ? (
        <div
          className="pointer-events-none absolute -top-1 -translate-x-1/2 border border-hairline bg-paper px-3 py-2 text-[12px] text-ink shadow-sm whitespace-nowrap"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <span className="text-mute">{shortDate(active.d.date)}</span>{' '}
          <span className="font-medium">{formatNaira(active.d.revenueKobo)}</span>{' '}
          <span className="text-mute">
            · {active.d.orders} order{active.d.orders === 1 ? '' : 's'}
          </span>
        </div>
      ) : null}
    </div>
  )
}

// ── Horizontal bar breakdown (HTML, direct labels) ────────────────

interface BreakdownRow {
  label: string
  sublabel?: string
  value: number
  display: string
}

function BreakdownCard({
  title,
  rows,
  loading,
}: {
  title: string
  rows: BreakdownRow[]
  loading: boolean
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="border border-hairline-soft bg-paper p-4 md:p-5">
      <div className="t-eyebrow text-mute mb-4">{title}</div>
      {loading ? (
        <div className="t-body-s text-mute py-6">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="t-body-s text-mute py-6">No data for this period.</div>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <span className="text-[13px] text-ink truncate">
                  {r.label}
                  {r.sublabel ? <span className="text-mute"> · {r.sublabel}</span> : null}
                </span>
                <span className="text-[13px] font-medium text-ink whitespace-nowrap">
                  {r.display}
                </span>
              </div>
              <div className="h-1.75 bg-cream rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink rounded-full"
                  style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
