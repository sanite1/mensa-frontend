// ═══════════════════════════════════════════════════════════════
// /account/orders — logged-in order history list.
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom'

import { useMyOrders } from '@/lib/network/api/order.api'
import { formatNaira } from '@/lib/utils'
import type { Order } from '@/lib/network/types/order.types'

export function OrdersPage() {
  const ordersQuery = useMyOrders({ pageSize: 50 })
  const orders = ordersQuery.data?.data?.items ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--mute)] font-medium">
          Your account
        </p>
        <h1 className="mt-2 font-serif italic text-4xl text-[var(--ink)]">
          Orders.
        </h1>
      </header>

      {ordersQuery.isLoading ? (
        <div className="text-[14px] text-[var(--mute)]">Loading your orders…</div>
      ) : ordersQuery.isError ? (
        <div className="border border-[var(--coral)] bg-[var(--coral-soft)] px-4 py-5 text-[14px] text-[var(--ink)]">
          We could not load your orders. Please refresh and try again.
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-[var(--hairline)] bg-[var(--cream-soft)] p-8 text-center">
          <p className="text-[14px] text-[var(--mute)] m-0">
            You have not placed an order yet.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-[var(--ink)] underline underline-offset-2"
          >
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </ul>
      )}
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const placed = new Date(order.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <li>
      <Link
        to={`/account/orders/${order._id}`}
        className="block border border-[var(--hairline)] bg-[var(--paper)] p-5 hover:border-[var(--ink)] transition-colors no-underline"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--mute)] font-medium">
              {order.orderNumber}
            </div>
            <div className="text-[15px] text-[var(--ink)] mt-1">
              {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'} ·{' '}
              {placed}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[15px] font-semibold text-[var(--ink)]">
              {formatNaira(order.totals.total)}
            </div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--mute)] font-medium mt-1">
              {order.payment.status === 'paid'
                ? order.fulfilment.status === 'shipped'
                  ? 'On the way'
                  : order.fulfilment.status === 'delivered'
                    ? 'Delivered'
                    : 'Preparing'
                : order.payment.status === 'failed'
                  ? 'Payment failed'
                  : 'Awaiting payment'}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}
