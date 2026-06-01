// ═══════════════════════════════════════════════════════════════
// OrderSummaryCard
//
// The shared "this is your order" panel reused on three screens:
//   • /checkout/confirmation/:orderNumber
//   • /orders/track          (public lookup)
//   • /account/orders/:id    (logged-in detail)
//
// It owns the visual rhythm of an order: status chip, line list,
// totals, address, tracking link. Anything else (page chrome,
// header copy, action buttons) is the caller's job.
// ═══════════════════════════════════════════════════════════════

import type { Order } from '@/lib/network/types/order.types'
import { Photo } from '@/components/shop/Photo'
import { cn } from '@/lib/utils'
import { useFormatPrice } from '@/lib/currency'

const PAYMENT_LABELS: Record<Order['payment']['status'], string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
  partial_refund: 'Partially refunded',
}

const FULFILMENT_LABELS: Record<Order['fulfilment']['status'], string> = {
  pending: 'Preparing',
  processing: 'Preparing',
  shipped: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function statusToneClass(payment: Order['payment']['status']): string {
  switch (payment) {
    case 'paid':
      return 'bg-[#E5F1E1] text-[#2F6B3A]'
    case 'failed':
      return 'bg-[#FBE4E4] text-[#B14242]'
    case 'refunded':
    case 'partial_refund':
      return 'bg-cream-soft text-ink'
    default:
      return 'bg-cream-soft text-mute'
  }
}

export function OrderSummaryCard({ order }: { order: Order }) {
  const formatPrice = useFormatPrice()
  return (
    <div className="border border-hairline bg-paper p-6 lg:p-8 flex flex-col gap-6">
      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'text-[11px] uppercase tracking-[0.12em] font-medium px-2.5 py-1',
            statusToneClass(order.payment.status),
          )}
        >
          {PAYMENT_LABELS[order.payment.status]}
        </span>
        <span className="text-[11px] uppercase tracking-[0.12em] font-medium px-2.5 py-1 bg-cream-soft text-ink">
          {FULFILMENT_LABELS[order.fulfilment.status]}
        </span>
      </div>

      {/* Lines */}
      <ul className="m-0 p-0 list-none flex flex-col">
        {order.lines.map((l) => (
          <li
            key={`${l.variantId}`}
            className="flex gap-4 py-4 border-b border-(--hairline-soft) last:border-b-0"
          >
            <div className="w-16 shrink-0">
              <Photo src={l.imageUrl} alt={l.productName} tone="blush" ratio="4/5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] text-(--ink) font-medium leading-tight">
                {l.productName}
              </div>
              <div className="text-[12px] uppercase tracking-widest text-(--mute) mt-1">
                {l.variantLabel}
              </div>
              <div className="text-[13px] text-(--graphite) mt-1">Qty {l.qty}</div>
            </div>
            <div className="text-[14px] text-(--ink) font-semibold whitespace-nowrap">
              {formatPrice(l.lineTotal)}
            </div>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="flex flex-col gap-2 text-[14px] text-(--graphite) border-t border-(--hairline-soft) pt-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(order.totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatPrice(order.totals.shipping)}</span>
        </div>
        {order.totals.discount > 0 ? (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>− {formatPrice(order.totals.discount)}</span>
          </div>
        ) : null}
      </div>
      <div className="flex justify-between items-baseline border-t border-(--hairline) pt-4">
        <span className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
          Total
        </span>
        <span className="text-2xl font-semibold text-(--ink)">
          {formatPrice(order.totals.total)}
        </span>
      </div>

      {/* Address + tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-(--hairline-soft)">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium pt-4">
            Delivering to
          </div>
          <p className="mt-2 text-[14px] text-(--ink) leading-relaxed m-0">
            {order.address.fullName}
            <br />
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}
            <br />
            {order.address.city}, {order.address.state}
            <br />
            {order.address.phone}
          </p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium pt-4">
            Shipping
          </div>
          <p className="mt-2 text-[14px] text-(--ink) leading-relaxed m-0">
            {order.fulfilment.shippingMethod === 'inhouse'
              ? 'In house rider'
              : 'Sendbox nationwide'}
          </p>
          {order.fulfilment.trackingCode ? (
            <div className="mt-3 text-[13px] text-(--graphite)">
              Tracking{' '}
              {order.fulfilment.trackingUrl ? (
                <a
                  href={order.fulfilment.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-(--ink) underline underline-offset-2"
                >
                  {order.fulfilment.trackingCode}
                </a>
              ) : (
                <span className="text-(--ink)">{order.fulfilment.trackingCode}</span>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
