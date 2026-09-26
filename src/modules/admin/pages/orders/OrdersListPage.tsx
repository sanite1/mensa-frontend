// /orders (admin) — orders table with spreadsheet style column filters.
// State, Delivery, Payment and Fulfilment headers each open a checklist of
// every value that exists across all orders. Filters are applied server
// side so paging stays correct.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ListFilter, X } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAdminOrderFacets, useAdminOrders } from '@/lib/network/api/order.api'
import type { FulfilmentStatus, Order, PaymentStatus } from '@/lib/network/types/order.types'
import { shippingLabel } from '@/lib/tracking'
import { formatNaira, cn } from '@/lib/utils'

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

const PAYMENT_OPTIONS = (Object.keys(PAYMENT_LABEL) as PaymentStatus[]).map((id) => ({
  id,
  label: PAYMENT_LABEL[id],
}))
const FULFILMENT_OPTIONS = (Object.keys(FULFILMENT_LABEL) as FulfilmentStatus[]).map((id) => ({
  id,
  label: FULFILMENT_LABEL[id],
}))

const GRID = 'grid grid-cols-[1.3fr_1.6fr_0.9fr_0.9fr_1.1fr_0.9fr_0.9fr_0.9fr] gap-x-4 items-center'

export function OrdersListPage() {
  const [search, setSearch] = useState('')
  const [paymentSel, setPaymentSel] = useState<string[]>([])
  const [fulfilmentSel, setFulfilmentSel] = useState<string[]>([])
  const [stateSel, setStateSel] = useState<string[]>([])
  const [deliverySel, setDeliverySel] = useState<string[]>([])

  const facets = useAdminOrderFacets()
  const stateOptions = (facets.data?.data?.states ?? []).map((s) => ({ id: s, label: s }))
  const deliveryOptions = (facets.data?.data?.deliveries ?? []).map((d) => ({ id: d, label: d }))

  const query = useAdminOrders({
    paymentStatuses: paymentSel.join(',') || undefined,
    fulfilmentStatuses: fulfilmentSel.join(',') || undefined,
    states: stateSel.join(',') || undefined,
    deliveries: deliverySel.join(',') || undefined,
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

  const activeFilters =
    paymentSel.length + fulfilmentSel.length + stateSel.length + deliverySel.length
  const clearAll = () => {
    setPaymentSel([])
    setFulfilmentSel([])
    setStateSel([])
    setDeliverySel([])
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Operations</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Orders
          </h1>
          <p className="t-body-s mt-2 text-graphite">
            Every order placed through Mensa. Search by number, email or name, and use the column
            headers to filter by state, delivery, payment or fulfilment.
          </p>
        </div>
      </div>

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
        {activeFilters > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink underline underline-offset-2"
          >
            <X size={13} /> Clear {activeFilters} filter{activeFilters === 1 ? '' : 's'}
          </button>
        ) : null}
      </div>

      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <div className="min-w-260">
          <div
            className={cn(
              GRID,
              'px-5 py-2 border-b border-hairline-soft bg-cream-soft text-[10px] uppercase tracking-[0.12em] font-medium text-mute font-mono',
            )}
          >
            <div>Order</div>
            <div>Customer</div>
            <div>Placed</div>
            <ColumnFilter
              label="State"
              options={stateOptions}
              selected={stateSel}
              onChange={setStateSel}
              loading={facets.isLoading}
            />
            <ColumnFilter
              label="Delivery"
              options={deliveryOptions}
              selected={deliverySel}
              onChange={setDeliverySel}
              loading={facets.isLoading}
            />
            <div>Amount</div>
            <ColumnFilter
              label="Payment"
              options={PAYMENT_OPTIONS}
              selected={paymentSel}
              onChange={setPaymentSel}
            />
            <ColumnFilter
              label="Fulfilment"
              options={FULFILMENT_OPTIONS}
              selected={fulfilmentSel}
              onChange={setFulfilmentSel}
            />
          </div>

          {query.isLoading ? (
            <LoadingRows />
          ) : query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : visible.length === 0 ? (
            <EmptyState hasFilter={search !== '' || activeFilters > 0} />
          ) : (
            visible.map((order, i) => (
              <Row key={order._id} order={order} isLast={i === visible.length - 1} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Column filter (spreadsheet style checklist) ─────────────────

function ColumnFilter({
  label,
  options,
  selected,
  onChange,
  loading,
}: {
  label: string
  options: { id: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  loading?: boolean
}) {
  const active = selected.length > 0
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 -ml-2 px-2 py-1 rounded-sm uppercase tracking-[0.12em] font-medium font-mono text-[10px] transition-colors hover:bg-cream hover:text-ink',
            active ? 'text-ink' : 'text-mute',
          )}
        >
          {label}
          <ListFilter size={12} strokeWidth={2} />
          {active ? (
            <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-pink text-paper text-[9px] leading-none">
              {selected.length}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60 max-h-80 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1.5 text-[11px] uppercase tracking-widest font-mono text-mute">
          <button
            type="button"
            onClick={() => onChange(options.map((o) => o.id))}
            className="hover:text-ink"
          >
            Select all
          </button>
          <button type="button" onClick={() => onChange([])} className="hover:text-ink">
            Clear
          </button>
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="px-2 py-2 text-[13px] text-mute">Loading…</div>
        ) : options.length === 0 ? (
          <div className="px-2 py-2 text-[13px] text-mute">No values yet.</div>
        ) : (
          options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.id}
              checked={selected.includes(o.id)}
              onCheckedChange={() => toggle(o.id)}
              // Keep the menu open so several boxes can be ticked in one go.
              onSelect={(e) => e.preventDefault()}
              className="text-[13.5px] normal-case tracking-normal font-sans text-ink"
            >
              {o.label}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Rows ────────────────────────────────────────────────────────

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
        GRID,
        'px-5 py-4 no-underline transition-colors hover:bg-cream-soft text-ink',
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
      <div className="text-[13px] text-graphite truncate pr-2">{order.address.state}</div>
      <div className="text-[13px] text-graphite truncate pr-2">{shippingLabel(order)}</div>

      <div className="text-[14px] text-ink font-medium whitespace-nowrap">
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
  const toneClass =
    status === 'paid'
      ? 'bg-ok/10 text-ok'
      : status === 'failed'
        ? 'bg-blush text-berry'
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

// ─── States ──────────────────────────────────────────────────────

function LoadingRows() {
  return (
    <>
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
    </>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="t-eyebrow text-err mb-3">Something went wrong</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
        We could not load the orders.
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
    <div className="p-12 text-center">
      <div className="t-eyebrow text-mute mb-3">{hasFilter ? 'No matches' : 'No orders yet'}</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
        {hasFilter
          ? 'Nothing matches those filters.'
          : 'Once customers start placing orders, they will show up here.'}
      </h3>
    </div>
  )
}
