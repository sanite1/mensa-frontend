// tracking.ts — estimated delivery helpers. ETA anchors to shippedAt once shipped, else paidAt plus a pack out cushion.

import type { Order } from '@/lib/network/types/order.types'

/** Days from ship time to delivery — inclusive low/high. */
const SHIPPING_LEAD_DAYS: Record<Order['fulfilment']['shippingMethod'], { min: number; max: number }> = {
  inhouse: { min: 1, max: 2 },
  sendbox: { min: 2, max: 5 },
}

/** Days we expect to spend packing before the order ships out. Used to
 *  push the ETA back when the order is still in pre-ship statuses. */
const PACK_OUT_DAYS = 1

export interface DeliveryEta {
  /** Lower bound of the delivery window. */
  earliest: Date
  /** Upper bound of the delivery window. */
  latest: Date
  /** Human-readable string ("Aug 14 to Aug 17"). */
  label: string
  /** True once the order is past the shipped step, so the window is
   *  anchored to a real ship date instead of an estimate. */
  anchoredToShip: boolean
}

/** Compute the estimated delivery window for an order. Returns null for
 *  orders that are unpaid or already delivered/cancelled (no point
 *  showing an estimate when there's a real outcome). */
export function estimatedDelivery(order: Order): DeliveryEta | null {
  if (order.payment.status !== 'paid') return null
  if (order.fulfilment.status === 'delivered') return null
  if (order.fulfilment.status === 'cancelled') return null

  const lead = SHIPPING_LEAD_DAYS[order.fulfilment.shippingMethod]
  const anchorIso =
    order.fulfilment.shippedAt ?? order.payment.paidAt ?? order.createdAt
  if (!anchorIso) return null

  const anchor = new Date(anchorIso)
  if (Number.isNaN(anchor.getTime())) return null

  // Pre-ship: add the pack-out window on top of the lead time.
  const padDays = order.fulfilment.shippedAt ? 0 : PACK_OUT_DAYS

  const earliest = addDays(anchor, padDays + lead.min)
  const latest = addDays(anchor, padDays + lead.max)

  return {
    earliest,
    latest,
    label: formatRange(earliest, latest),
    anchoredToShip: !!order.fulfilment.shippedAt,
  }
}

/** Short pill-friendly status — "Paid", "Preparing", "Shipped",
 *  "Delivered", "Cancelled", "Awaiting payment". */
export function shortStatus(order: Order): string {
  if (order.payment.status === 'failed') return 'Payment failed'
  if (order.payment.status === 'refunded') return 'Refunded'
  if (order.payment.status === 'partial_refund') return 'Partially refunded'
  if (order.payment.status !== 'paid') return 'Awaiting payment'
  switch (order.fulfilment.status) {
    case 'pending':
      return 'Paid'
    case 'processing':
      return 'Preparing'
    case 'shipped':
      return 'Shipped'
    case 'delivered':
      return 'Delivered'
    case 'cancelled':
      return 'Cancelled'
  }
}

/** Tailwind class set for a status pill — keeps the same colour
 *  language as the timeline (ink for done, ok for delivered, blush
 *  for cancelled, pink-ish for in flight). */
export function statusPillClasses(order: Order): string {
  if (order.payment.status === 'failed' || order.payment.status === 'refunded') {
    return 'bg-blush text-berry'
  }
  if (order.payment.status !== 'paid') return 'bg-cream text-mute'
  switch (order.fulfilment.status) {
    case 'delivered':
      return 'bg-ok/10 text-ok'
    case 'cancelled':
      return 'bg-blush text-berry'
    case 'shipped':
      return 'bg-pink text-paper'
    case 'processing':
    case 'pending':
    default:
      return 'bg-cream text-graphite'
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatRange(earliest: Date, latest: Date): string {
  const sameMonth = earliest.getMonth() === latest.getMonth()
  const earlyLabel = earliest.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
  })
  const lateLabel = latest.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short',
  })
  if (earliest.toDateString() === latest.toDateString()) return earlyLabel
  return `${earlyLabel} to ${lateLabel}`
}
