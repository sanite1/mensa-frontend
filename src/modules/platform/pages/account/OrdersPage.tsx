// /account/orders, order history list with status pill and ETA per row.

import { Link } from 'react-router-dom'

import { useMyOrders } from '@/lib/network/api/order.api'
import { cn } from '@/lib/utils'
import { useFormatPrice } from '@/lib/currency'
import { estimatedDelivery, shortStatus, statusPillClasses } from '@/lib/tracking'
import { useSeo } from '@/lib/seo'
import type { Order } from '@/lib/network/types/order.types'

export function OrdersPage() {
  useSeo({ title: 'Your orders', noindex: true })
  const ordersQuery = useMyOrders({ pageSize: 50 })
  const orders: Order[] = ordersQuery.data?.data?.items ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-mute font-medium font-mono">
            Your account
          </p>
          <h1 className="m-0 mt-2 font-display italic font-semibold text-[clamp(32px,4vw,44px)] leading-tight tracking-tight text-ink">
            Orders.
          </h1>
        </div>
        <Link
          to="/orders/track"
          className="text-[13px] uppercase tracking-widest font-medium text-ink underline underline-offset-4 hover:text-pink-deep"
        >
          Track by number
        </Link>
      </header>

      {ordersQuery.isLoading ? (
        <div className="text-[14px] text-mute">Loading your orders…</div>
      ) : ordersQuery.isError ? (
        <div className="border border-coral/50 bg-blush px-4 py-5 text-[14px] text-berry">
          We could not load your orders. Please refresh and try again.
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-hairline bg-cream-soft p-8 text-center">
          <p className="text-[14px] text-mute m-0">You have not placed an order yet.</p>
          <Link to="/shop" className="mt-4 inline-block text-ink underline underline-offset-2">
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
  const formatPrice = useFormatPrice()
  const placed = new Date(order.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const eta = estimatedDelivery(order)
  const status = shortStatus(order)
  const pillClass = statusPillClasses(order)

  return (
    <li>
      <Link
        to={`/account/orders/${order._id}`}
        className="block border border-hairline bg-paper p-5 hover:border-ink transition-colors no-underline"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-mute font-medium font-mono">
              {order.orderNumber}
            </div>
            <div className="text-[15px] text-ink mt-1">
              {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'} · {placed}
            </div>
            {eta ? (
              <div className="text-[12px] text-graphite mt-1">
                <span className="text-mute uppercase tracking-widest font-medium font-mono mr-1.5">
                  {eta.anchoredToShip ? 'Arriving' : 'Estimated'}
                </span>
                {eta.label}
              </div>
            ) : null}
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <div className="text-[15px] font-semibold text-ink">
              {formatPrice(order.totals.total)}
            </div>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
                pillClass,
              )}
            >
              {status}
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}
