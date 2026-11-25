// /account/orders/:id, logged in order detail.

import { Link, useParams } from 'react-router-dom'

import { AccountShell } from '@/modules/platform/components/AccountShell'
import { OrderSummaryCard } from '@/modules/platform/components/OrderSummaryCard'
import { FulfilmentTimeline } from '@/modules/platform/components/FulfilmentTimeline'
import { useMyOrder } from '@/lib/network/api/order.api'
import { useSeo } from '@/lib/seo'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useMyOrder(id)
  const order = query.data?.data?.order
  useSeo({
    title: order ? `Order ${order.orderNumber}` : 'Order',
    noindex: true,
  })

  return (
    <AccountShell
      back={{ to: '/account/orders', label: '← Back to orders' }}
      eyebrow={order ? `Order ${order.orderNumber}` : 'Order'}
      title={<>Your order.</>}
    >
      {query.isLoading ? (
        <p className="text-(--mute)">Loading order…</p>
      ) : query.isError || !order ? (
        <div className="ptn-card text-(--berry)">We could not find that order on your account.</div>
      ) : (
        <>
          {order.payment.status === 'paid' ? (
            <div className="mb-6">
              <FulfilmentTimeline order={order} />
            </div>
          ) : null}
          <OrderSummaryCard order={order} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn--ghost" to="/shop">
              Continue shopping
            </Link>
            {order.fulfilment.trackingUrl ? (
              <a
                className="btn"
                href={order.fulfilment.trackingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Track package
              </a>
            ) : null}
          </div>
        </>
      )}
    </AccountShell>
  )
}
