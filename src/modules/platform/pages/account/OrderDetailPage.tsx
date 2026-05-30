// ═══════════════════════════════════════════════════════════════
// /account/orders/:id — logged-in order detail.
// ═══════════════════════════════════════════════════════════════

import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { OrderSummaryCard } from '@/modules/platform/components/OrderSummaryCard'
import { useMyOrder } from '@/lib/network/api/order.api'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useMyOrder(id)
  const order = query.data?.data?.order

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <div className="mb-6">
        <Link
          to="/account/orders"
          className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium hover:text-(--ink)"
        >
          ← Back to orders
        </Link>
      </div>

      {query.isLoading ? (
        <div className="text-[14px] text-(--mute)">Loading order…</div>
      ) : query.isError || !order ? (
        <div className="border border-(--coral) bg-(--coral-soft) px-4 py-5 text-[14px] text-(--ink)">
          We could not find that order on your account.
        </div>
      ) : (
        <>
          <header className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
              Order {order.orderNumber}
            </p>
            <h1 className="mt-2 font-serif italic text-4xl text-(--ink)">Your order.</h1>
          </header>
          <OrderSummaryCard order={order} />
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild variant="secondary" size="lg">
              <Link to="/shop">Continue shopping</Link>
            </Button>
            {order.fulfilment.trackingUrl ? (
              <Button asChild variant="primary" size="lg">
                <a href={order.fulfilment.trackingUrl} target="_blank" rel="noreferrer">
                  Track package
                </a>
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
