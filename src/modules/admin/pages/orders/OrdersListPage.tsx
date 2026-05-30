// ═══════════════════════════════════════════════════════════════
// /orders (admin) — read-only orders table for Sprint 3.
//
// Sprint 4 will add filters, search, status mutation, and a per
// order detail page. For now this just surfaces what's coming in
// so the team can spot-check the checkout pipeline.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import { useAdminOrders } from '@/lib/network/api/order.api'
import type { FulfilmentStatus, Order, PaymentStatus } from '@/lib/network/types/order.types'
import { formatNaira, cn } from '@/lib/utils'

const PAYMENT_FILTERS: { id: PaymentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
]

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  partial_refund: 'Partial refund',
}

const FULFILMENT_LABEL: Record<FulfilmentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrdersListPage() {
  const [payment, setPayment] = useState<PaymentStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const query = useAdminOrders({
    paymentStatus: payment === 'all' ? undefined : payment,
    pageSize: 100,
  })
  const orders: Order[] = query.data?.data?.items ?? []

  const visible = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.address.fullName.toLowerCase().includes(q),
    )
  }, [orders, search])

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Operations</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Orders
          </h1>
          <p className="t-body-s mt-2 text-graphite">
            Every order placed through Mensa. Filter by payment status or search by number, email,
            or name.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap mb-5 md:mb-6">
        <div className="relative flex-1 min-w-full sm:min-w-60 max-w-full sm:max-w-105">
          <Search
            size={16}
            strokeWidth={1.6}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders"
            className="h-10 w-full pl-10 pr-3.5 bg-paper border border-hairline text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PAYMENT_FILTERS.map((f) => {
            const isActive = f.id === payment
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setPayment(f.id)}
                className={cn(
                  'inline-flex items-center rounded-full font-sans font-medium whitespace-nowrap transition-colors',
                  'px-3.5 py-1.5 text-[12.5px]',
                  isActive
                    ? 'bg-ink text-paper border border-ink'
                    : 'bg-transparent text-ink border border-hairline hover:border-ink',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState hasFilter={search !== '' || payment !== 'all'} />
      ) : (
        <OrdersTable orders={visible} />
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────
function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <div className="border border-hairline-soft bg-paper overflow-x-auto">
      <div className="min-w-215">
        <div className="grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_0.8fr] items-center px-5 py-3 border-b border-hairline-soft bg-cream-soft text-[10px] uppercase tracking-[0.12em] font-medium text-mute font-mono">
          <div>Order</div>
          <div>Customer</div>
          <div>Placed</div>
          <div className="text-right">Total</div>
          <div>Payment</div>
          <div>Fulfilment</div>
        </div>

        {orders.map((order, i) => (
          <Row key={order._id} order={order} isLast={i === orders.length - 1} />
        ))}
      </div>
    </div>
  )
}

function Row({ order, isLast }: { order: Order; isLast: boolean }) {
  const placed = new Date(order.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      to={`/orders/${order._id}`}
      className={cn(
        'grid grid-cols-[1.4fr_1.6fr_1fr_1fr_1fr_0.8fr] items-center px-5 py-4 no-underline transition-colors hover:bg-cream-soft text-ink',
        !isLast && 'border-b border-hairline-soft',
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-ink font-mono text-[13px] tracking-[0.04em]">
          {order.orderNumber}
        </div>
        <div className="text-[12px] text-mute mt-0.5">
          {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-[14px] text-ink truncate">{order.address.fullName}</div>
        <div className="text-[12px] text-mute truncate mt-0.5">{order.customerEmail}</div>
      </div>

      <div className="text-[13px] text-graphite">{placed}</div>

      <div className="text-right text-[14px] text-ink font-medium">
        {formatNaira(order.totals.total)}
      </div>

      <div>
        <StatusChip status={order.payment.status} />
      </div>

      <div className="text-[12px] text-graphite">{FULFILMENT_LABEL[order.fulfilment.status]}</div>
    </Link>
  )
}

function StatusChip({ status }: { status: PaymentStatus }) {
  // Tone class lookup keeps the chip Tailwind-only. The hex fallbacks
  // from the old inline style are preserved as arbitrary-value classes
  // so any environment without the CSS vars still renders the right
  // colours.
  const toneClass =
    status === 'paid'
      ? 'bg-[#E5F1E1] text-[#2F6B3A]'
      : status === 'failed'
        ? 'bg-[#FBE4E4] text-[#B14242]'
        : 'bg-cream-soft text-mute'

  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] uppercase tracking-widest font-medium px-2 py-1',
        toneClass,
      )}
    >
      {PAYMENT_LABEL[status]}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="border border-hairline-soft bg-paper">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4 border-b border-hairline-soft last:border-b-0"
        >
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 bg-cream-soft animate-pulse w-1/4" />
            <div className="h-3 bg-cream-soft animate-pulse w-1/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-err mb-3">Something went wrong</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
        We couldn't load the orders.
      </h3>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-block text-ink underline underline-offset-2"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-mute mb-3">{hasFilter ? 'No matches' : 'No orders yet'}</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
        {hasFilter
          ? 'Nothing matches that filter.'
          : 'Once customers start placing orders, they will show up here.'}
      </h3>
    </div>
  )
}
