// /account/orders, order history list with status pill and ETA per row.

import { Link } from 'react-router-dom'

import { useMyOrders } from '@/lib/network/api/order.api'
import { cn } from '@/lib/utils'
import { useFormatPrice } from '@/lib/currency'
import { estimatedDelivery, shortStatus, statusPillClasses } from '@/lib/tracking'
import { useSeo } from '@/lib/seo'
import { AccountShell } from '@/modules/platform/components/AccountShell'
import type { Order } from '@/lib/network/types/order.types'

export function OrdersPage() {
  useSeo({ title: 'Your orders', noindex: true })
  const ordersQuery = useMyOrders({ pageSize: 50 })
  const orders: Order[] = ordersQuery.data?.data?.items ?? []

  return (
    <AccountShell
      eyebrow="Your account"
      title={<>Orders.</>}
      aside={
        <Link className="btn btn--ghost" to="/orders/track">
          Track by number
        </Link>
      }
    >
      {ordersQuery.isLoading ? (
        <p className="text-(--mute)">Loading your orders…</p>
      ) : ordersQuery.isError ? (
        <div className="ptn-card text-(--berry)">
          We could not load your orders. Please refresh and try again.
        </div>
      ) : orders.length === 0 ? (
        <div className="ptn-card text-center">
          <p className="text-(--mute)">You have not placed an order yet.</p>
          <Link to="/shop" className="btn mt-6">
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </ul>
      )}
    </AccountShell>
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
        className="ptn-card block no-underline transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="eyebrow">{order.orderNumber}</div>
            <div className="mt-2 text-(--ink)">
              {order.lines.length} {order.lines.length === 1 ? 'item' : 'items'} · {placed}
            </div>
            {eta ? (
              <div className="mt-1 text-(length:--fs-sm) text-(--mute)">
                <span className="mr-1.5 font-medium text-(--ink)">
                  {eta.anchoredToShip ? 'Arriving' : 'Estimated'}
                </span>
                {eta.label}
              </div>
            ) : null}
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <div className="text-(length:--fs-lg) font-medium text-(--ink)">
              {formatPrice(order.totals.total)}
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em]',
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
