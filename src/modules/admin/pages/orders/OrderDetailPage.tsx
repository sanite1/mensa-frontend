// /orders/:id (admin) — full order detail + fulfilment controls.

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Truck, PackageCheck, PackageX, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminOrder, useUpdateOrderFulfilment } from '@/lib/network/api/order.api'
import type { FulfilmentStatus, Order, PaymentStatus } from '@/lib/network/types/order.types'
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

const FULFILMENT_ORDER: FulfilmentStatus[] = ['pending', 'processing', 'shipped', 'delivered']

/** Mirror of canTransitionFulfilment on the backend so the UI surfaces
 *  the same allowed list. Backend re-validates on PATCH. */
function allowedNextStatuses(from: FulfilmentStatus): FulfilmentStatus[] {
  if (from === 'delivered' || from === 'cancelled') return []
  const fromIdx = FULFILMENT_ORDER.indexOf(from)
  const forward = FULFILMENT_ORDER.slice(fromIdx + 1)
  const cancel: FulfilmentStatus[] = from === 'shipped' ? [] : ['cancelled']
  return [...forward, ...cancel]
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminOrder(id)
  const order = query.data?.data?.order

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-mute font-medium hover:text-ink no-underline"
        >
          <ArrowLeft size={14} strokeWidth={1.6} />
          All orders
        </Link>
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError || !order ? (
        <ErrorState />
      ) : (
        <OrderView order={order} />
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────
function OrderView({ order }: { order: Order }) {
  const placed = new Date(order.createdAt).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <div className="t-eyebrow text-mute mb-3 font-mono tracking-[0.12em]">
            Order {order.orderNumber}
          </div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,4vw,40px)] leading-[1.05] tracking-tight text-ink">
            {order.address.fullName}
          </h1>
          <p className="t-body-s mt-2 text-graphite">Placed {placed}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusChip
            toneClass={paymentToneClass(order.payment.status)}
            label={PAYMENT_LABEL[order.payment.status]}
          />
          <StatusChip
            toneClass={fulfilmentToneClass(order.fulfilment.status)}
            label={FULFILMENT_LABEL[order.fulfilment.status]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <FulfilmentTimeline order={order} />
          <LinesCard order={order} />
          <CustomerCard order={order} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <FulfilmentControls order={order} />
          <PaymentCard order={order} />
          {order.internalNotes ? <InternalNotesCard notes={order.internalNotes} /> : null}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
function FulfilmentTimeline({ order }: { order: Order }) {
  const current = order.fulfilment.status
  return (
    <div className="border border-hairline-soft bg-paper p-5">
      <div className="t-eyebrow text-mute mb-4">Fulfilment</div>
      <ol className="m-0 p-0 list-none flex flex-wrap gap-4">
        {FULFILMENT_ORDER.map((step, i) => {
          const currentIdx = FULFILMENT_ORDER.indexOf(current)
          const reached = currentIdx >= i && current !== 'cancelled'
          const isCurrent = current === step
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-2 text-[12.5px]',
                reached ? 'text-ink' : 'text-mute',
              )}
            >
              <span
                className={cn(
                  'rounded-full w-2.5 h-2.5',
                  isCurrent ? 'bg-pink shadow-blush-ring' : reached ? 'bg-ink' : 'bg-hairline',
                )}
              />
              {FULFILMENT_LABEL[step]}
              {i < FULFILMENT_ORDER.length - 1 ? (
                <span aria-hidden className="hidden sm:inline-block w-8 h-px bg-hairline" />
              ) : null}
            </li>
          )
        })}
        {current === 'cancelled' ? (
          <li className="flex items-center gap-2 text-[12.5px] text-coral">
            <span className="rounded-full w-2.5 h-2.5 bg-coral" />
            Cancelled
          </li>
        ) : null}
      </ol>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function LinesCard({ order }: { order: Order }) {
  return (
    <div className="border border-hairline-soft bg-paper">
      <div className="px-5 py-4 border-b border-hairline-soft">
        <div className="t-eyebrow text-mute">Items</div>
      </div>
      <ul className="m-0 p-0 list-none">
        {order.lines.map((l) => (
          <li
            key={`${l.variantId}`}
            className="grid grid-cols-[52px_1fr_auto] items-center px-5 py-4 border-b border-hairline-soft last:border-b-0"
          >
            <div className="w-12 h-12 bg-blush flex items-center justify-center overflow-hidden rounded-xs">
              {l.imageUrl ? (
                <img
                  src={l.imageUrl}
                  alt={l.productName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 ml-3">
              <div className="text-[14px] text-ink font-medium leading-tight">{l.productName}</div>
              <div className="text-[12px] uppercase tracking-widest text-mute font-mono mt-1">
                {l.sku}
              </div>
              <div className="text-[13px] text-graphite mt-1">
                {l.variantLabel} · Qty {l.qty}
              </div>
            </div>
            <div className="text-[14px] text-ink font-medium whitespace-nowrap">
              {formatNaira(l.lineTotal)}
            </div>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4 border-t border-hairline-soft flex flex-col gap-2 text-[13px] text-graphite">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNaira(order.totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping ({order.fulfilment.shippingMethod})</span>
          <span>{formatNaira(order.totals.shipping)}</span>
        </div>
        {order.totals.discount > 0 ? (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>− {formatNaira(order.totals.discount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between pt-2 mt-2 border-t border-hairline-soft text-ink font-semibold text-[15px]">
          <span>Total</span>
          <span>{formatNaira(order.totals.total)}</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function CustomerCard({ order }: { order: Order }) {
  return (
    <div className="border border-hairline-soft bg-paper p-5">
      <div className="t-eyebrow text-mute mb-3">Customer</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[14px]">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-mute mb-1.5">Contact</div>
          <div className="text-ink">{order.customerEmail}</div>
          <div className="text-graphite mt-0.5">{order.customerPhone}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-mute mb-1.5">Delivery</div>
          <div className="text-ink leading-relaxed">
            {order.address.fullName}
            <br />
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}
            <br />
            {order.address.city}, {order.address.state}
            <br />
            {order.address.phone}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function FulfilmentControls({ order }: { order: Order }) {
  const allowed = allowedNextStatuses(order.fulfilment.status)
  const update = useUpdateOrderFulfilment()

  const [trackingCode, setTrackingCode] = useState(order.fulfilment.trackingCode ?? '')
  const [trackingUrl, setTrackingUrl] = useState(order.fulfilment.trackingUrl ?? '')
  const [note, setNote] = useState('')

  const submitTransition = (status: FulfilmentStatus) => {
    update.mutate(
      {
        id: order._id,
        payload: {
          status,
          // Only send tracking + note on the relevant transition so we
          // don't overwrite previously-saved fields with stale form state.
          trackingCode: status === 'shipped' ? trackingCode || undefined : undefined,
          trackingUrl: status === 'shipped' ? trackingUrl || undefined : undefined,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => setNote(''),
      },
    )
  }

  if (allowed.length === 0) {
    return (
      <div className="border border-hairline-soft bg-paper p-5">
        <div className="t-eyebrow text-mute mb-2">Update</div>
        <p className="text-[13px] text-graphite m-0">
          This order is in a terminal state and cannot be transitioned further.
        </p>
      </div>
    )
  }

  // Show tracking inputs only when 'shipped' is one of the next actions.
  const showTracking = allowed.includes('shipped')

  return (
    <div className="border border-hairline-soft bg-paper p-5 flex flex-col gap-4">
      <div className="t-eyebrow text-mute">Update fulfilment</div>

      {order.payment.status !== 'paid' ? (
        <p className="text-[12px] text-coral m-0">
          Payment is not confirmed. You can cancel this order, but cannot mark it processing,
          shipped, or delivered until paid.
        </p>
      ) : null}

      {showTracking ? (
        <div className="flex flex-col gap-3">
          <FormPair
            label="Tracking code"
            value={trackingCode}
            onChange={setTrackingCode}
            placeholder={
              order.fulfilment.shippingMethod === 'sendbox' ? 'SB-...' : 'In-house rider id'
            }
          />
          <FormPair
            label="Tracking URL"
            value={trackingUrl}
            onChange={setTrackingUrl}
            placeholder="https://"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] uppercase tracking-widest text-mute font-medium">
          Internal note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Customer requested gift wrap…"
          className="bg-paper border border-hairline px-3 py-2 text-[14px] text-ink focus-visible:outline-none focus-visible:border-ink resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        {allowed.map((status) => {
          const meta = TRANSITION_META[status]
          const disabled =
            update.isPending || (status !== 'cancelled' && order.payment.status !== 'paid')
          return (
            <Button
              key={status}
              variant={meta.variant}
              size="lg"
              disabled={disabled}
              onClick={() => submitTransition(status)}
            >
              {meta.icon ? <meta.icon size={16} strokeWidth={1.6} /> : null}
              {update.isPending ? 'Saving…' : meta.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface TransitionMeta {
  label: string
  variant: 'primary' | 'secondary' | 'coral' | 'ink'
  icon?: typeof Truck
}

const TRANSITION_META: Record<FulfilmentStatus, TransitionMeta> = {
  pending: { label: 'Move to pending', variant: 'secondary' },
  processing: {
    label: 'Mark as processing',
    variant: 'secondary',
    icon: RefreshCw,
  },
  shipped: { label: 'Mark as shipped', variant: 'primary', icon: Truck },
  delivered: {
    label: 'Mark as delivered',
    variant: 'ink',
    icon: PackageCheck,
  },
  cancelled: { label: 'Cancel order', variant: 'coral', icon: PackageX },
}

// ─────────────────────────────────────────────────────────────────
function PaymentCard({ order }: { order: Order }) {
  const paidAt = order.payment.paidAt
    ? new Date(order.payment.paidAt).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'
  return (
    <div className="border border-hairline-soft bg-paper p-5">
      <div className="t-eyebrow text-mute mb-3">Payment</div>
      <dl className="m-0 grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
        <dt className="text-mute">Status</dt>
        <dd className="m-0 text-ink">{PAYMENT_LABEL[order.payment.status]}</dd>
        <dt className="text-mute">Reference</dt>
        <dd className="m-0 text-ink font-mono">{order.payment.reference}</dd>
        <dt className="text-mute">Paid at</dt>
        <dd className="m-0 text-ink">{paidAt}</dd>
      </dl>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function InternalNotesCard({ notes }: { notes: string }) {
  return (
    <div className="border border-hairline-soft bg-cream-soft p-5">
      <div className="t-eyebrow text-mute mb-3">Internal notes</div>
      <pre className="m-0 text-[12.5px] text-graphite whitespace-pre-wrap font-mono leading-normal">
        {notes}
      </pre>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function FormPair({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-mute font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-paper border border-hairline px-3 h-10 text-[14px] text-ink focus-visible:outline-none focus-visible:border-ink"
      />
    </div>
  )
}

// Status chip with tone classes resolved at the call site, keeps the component free of inline styles.
function StatusChip({ toneClass, label }: { toneClass: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] uppercase tracking-widest font-medium px-2.5 py-1',
        toneClass,
      )}
    >
      {label}
    </span>
  )
}

function paymentToneClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-ok text-paper'
    case 'failed':
      return 'bg-coral text-paper'
    case 'refunded':
    case 'partial_refund':
      return 'bg-cream text-ink'
    default:
      return 'bg-cream text-mute'
  }
}

function fulfilmentToneClass(status: FulfilmentStatus): string {
  switch (status) {
    case 'delivered':
      return 'bg-ok text-paper'
    case 'shipped':
      return 'bg-ink text-paper'
    case 'cancelled':
      return 'bg-coral text-paper'
    case 'processing':
      return 'bg-blush text-berry'
    default:
      return 'bg-cream text-mute'
  }
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-mute">Loading order…</div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-err mb-3">Not found</div>
      <p className="text-[14px] text-graphite m-0">
        We could not load that order. It may have been deleted or the id is wrong.
      </p>
      <Button asChild variant="secondary" size="default" className="mt-5">
        <Link to="/orders">Back to orders</Link>
      </Button>
    </div>
  )
}
