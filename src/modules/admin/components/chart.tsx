// Admin charts ported from the design repo (components/admin/chart.tsx):
// daily revenue bars with a hover readout, and a thin share bar.
import { useMemo, useState } from 'react'
import { formatNaira } from '@/lib/utils'

type Point = { date: string; revenueKobo: number; orders: number }

/** ₦2.9m, ₦45k, ₦800. */
function formatNairaShort(kobo: number): string {
  const n = kobo / 100
  if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}m`
  if (Math.abs(n) >= 1_000) return `₦${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return `₦${Math.round(n)}`
}

/** A round top for the axis: 2,870,000 becomes 3,000,000. */
function niceMax(v: number) {
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
}

/** Daily revenue as bars, with a hover readout. Bars stretch to the card. */
export function RevenueChart({ data, height = 240 }: { data: Point[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = useMemo(() => niceMax(Math.max(1, ...data.map((d) => d.revenueKobo))), [data])
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const W = 1000
  const H = height
  const pad = { l: 56, r: 8, t: 12, b: 28 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const step = iw / Math.max(1, data.length)
  const bw = Math.max(2, Math.min(28, step * 0.62))
  const labelEvery = Math.ceil(data.length / 7)
  const h = hover !== null ? data[hover] : null
  const day = (iso: string, o: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('en-NG', o)

  return (
    <div className="a-chart" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Revenue per day"
      >
        {ticks.map((t) => {
          const y = pad.t + ih - (t / max) * ih
          return <line key={t} x1={pad.l} x2={W - pad.r} y1={y} y2={y} className="a-chart__grid" />
        })}
        {data.map((d, i) => {
          const bh = (d.revenueKobo / max) * ih
          const x = pad.l + i * step + (step - bw) / 2
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)}>
              <rect x={pad.l + i * step} y={pad.t} width={step} height={ih} fill="transparent" />
              <rect
                x={x}
                y={pad.t + ih - bh}
                width={bw}
                height={Math.max(bh, d.revenueKobo ? 2 : 0)}
                rx={Math.min(4, bw / 2)}
                className={hover === i ? 'a-chart__bar is-hover' : 'a-chart__bar'}
              />
            </g>
          )
        })}
      </svg>
      <div className="a-chart__y" style={{ top: pad.t, height: ih }}>
        {[...ticks].reverse().map((t) => (
          <span key={t}>{formatNairaShort(t)}</span>
        ))}
      </div>
      <div
        className="a-chart__x"
        style={{ left: `${(pad.l / W) * 100}%`, right: `${(pad.r / W) * 100}%` }}
      >
        {data.map((d, i) => (
          <span
            key={d.date}
            style={{
              visibility: i % labelEvery === 0 || i === data.length - 1 ? 'visible' : 'hidden',
            }}
          >
            {day(d.date, { day: 'numeric', month: 'short' })}
          </span>
        ))}
      </div>
      {h && hover !== null ? (
        <div
          className="a-chart__tip"
          style={{ left: `${((pad.l + (hover + 0.5) * step) / W) * 100}%` }}
        >
          <strong>{formatNaira(h.revenueKobo)}</strong>
          <span>
            {h.orders} order{h.orders === 1 ? '' : 's'} ·{' '}
            {day(h.date, { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/** A thin horizontal share bar, for product, category and status breakdowns. */
export function ShareBar({ value, max }: { value: number; max: number }) {
  return (
    <span className="a-share" aria-hidden>
      <span style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }} />
    </span>
  )
}
