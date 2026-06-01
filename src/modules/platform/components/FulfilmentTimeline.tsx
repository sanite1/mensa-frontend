// ═══════════════════════════════════════════════════════════════
// FulfilmentTimeline
//
// Stage-first tracker for an order. The card is built around a
// single visual answer to the question "where is my order?" — a
// large stage headline, a plain-English explanation, an ETA pill,
// and a slim 4-step rail underneath for context.
//
// Pipeline: Paid -> Preparing -> Shipped -> Delivered
// Sink:     Cancelled  (gets its own dedicated panel)
//
// Used on /orders/track, /checkout/confirmation/:orderNumber,
// and /account/orders/:id.
// ═══════════════════════════════════════════════════════════════

import type { Order } from '@/lib/network/types/order.types'
import { Check, Package, Truck, Sparkles, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { estimatedDelivery } from '@/lib/tracking'

type StageId = 'paid' | 'processing' | 'shipped' | 'delivered'

interface StageMeta {
  id: StageId
  /** Tile label under the step dot. */
  short: string
  /** Big headline shown when this is the current stage. */
  headline: string
  /** Plain-English explanation paired with the headline. */
  body: (order: Order) => string
}

const STAGES: StageMeta[] = [
  {
    id: 'paid',
    short: 'Paid',
    headline: 'Payment received.',
    body: () =>
      'Thanks. We have your payment. Our studio team will start packing your order shortly.',
  },
  {
    id: 'processing',
    short: 'Preparing',
    headline: 'We are packing your order.',
    body: () =>
      'Your items are being checked and packed in our Abuja studio. You will get an email the moment it ships.',
  },
  {
    id: 'shipped',
    short: 'Shipped',
    headline: 'Your order is on the way.',
    body: (order) =>
      order.fulfilment.shippingMethod === 'inhouse'
        ? 'A Mensa rider has your order. It should reach you today or tomorrow.'
        : 'Your order has left our studio with Sendbox. It should reach you within 2 to 5 working days.',
  },
  {
    id: 'delivered',
    short: 'Delivered',
    headline: 'Delivered.',
    body: () =>
      'Your order arrived. We hope you love it. Reach us at hi@mensaproducts.com if anything is off.',
  },
]

const STAGE_ICON: Record<StageId, typeof Package> = {
  paid: Sparkles,
  processing: ClipboardCheck,
  shipped: Truck,
  delivered: Package,
}

function currentStageIndex(order: Order): number {
  if (order.payment.status !== 'paid') return -1
  switch (order.fulfilment.status) {
    case 'delivered':
      return 3
    case 'shipped':
      return 2
    case 'processing':
      return 1
    default:
      return 0
  }
}

export function FulfilmentTimeline({ order }: { order: Order }) {
  // ── Cancelled: dedicated panel, nothing else makes sense ──────────
  if (order.fulfilment.status === 'cancelled') {
    return (
      <div className="border border-coral/40 bg-blush p-6 lg:p-8 text-center flex flex-col items-center gap-3">
        <div className="t-eyebrow text-coral">Cancelled</div>
        <h2 className="m-0 font-display italic font-semibold text-[clamp(24px,4vw,40px)] leading-tight tracking-tight text-berry">
          This order was cancelled.
        </h2>
        <p className="m-0 t-body text-berry max-w-130">
          If you were charged, the refund will land on the same card within 5 to 10 business
          days. Reach us at hi@mensaproducts.com with any questions.
        </p>
      </div>
    )
  }

  const currentIdx = currentStageIndex(order)
  const current = currentIdx >= 0 ? STAGES[currentIdx] : STAGES[0]
  const eta = estimatedDelivery(order)
  const Icon = STAGE_ICON[current.id]
  const isComplete = current.id === 'delivered'

  return (
    <div className="border border-hairline bg-paper overflow-hidden">
      {/* Hero — the answer to "where is my order?" */}
      <div
        className={cn(
          'px-6 py-8 lg:px-10 lg:py-12 flex flex-col items-center text-center gap-5 border-b border-hairline-soft',
          isComplete ? 'bg-ok/5' : 'bg-blush',
        )}
      >
        <div
          className={cn(
            'inline-flex items-center justify-center w-16 h-16 rounded-full',
            isComplete ? 'bg-ok text-paper' : 'bg-paper text-berry shadow-blush-ring',
          )}
        >
          <Icon size={28} strokeWidth={1.6} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="t-eyebrow text-mute">Order {order.orderNumber}</div>
          <h2
            className={cn(
              'm-0 font-display italic font-semibold text-[clamp(28px,5vw,52px)] leading-[1.05] tracking-tight max-w-150',
              isComplete ? 'text-ok' : 'text-berry',
            )}
          >
            {current.headline}
          </h2>
          <p
            className={cn(
              'm-0 mt-1 t-body-l max-w-130 leading-relaxed',
              isComplete ? 'text-graphite' : 'text-berry/85',
            )}
          >
            {current.body(order)}
          </p>
        </div>

        {eta ? (
          <div className="mt-2 inline-flex items-baseline gap-2 px-4 py-2 bg-paper border border-hairline rounded-full">
            <span className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              {eta.anchoredToShip ? 'Arriving' : 'Estimated delivery'}
            </span>
            <span className="text-[14px] font-medium text-ink">{eta.label}</span>
          </div>
        ) : null}
      </div>

      {/* Slim rail — minimal stage context */}
      <ol className="m-0 p-0 list-none grid grid-cols-4 px-4 py-5 lg:px-8 lg:py-6">
        {STAGES.map((stage, i) => {
          const reached = i <= currentIdx
          const isCurrent = i === currentIdx
          const done = i < currentIdx
          return (
            <li key={stage.id} className="flex flex-col items-center text-center gap-2 min-w-0">
              <div className="flex items-center w-full">
                {/* Left connector */}
                {i > 0 ? (
                  <span
                    aria-hidden
                    className={cn(
                      'flex-1 h-px',
                      i <= currentIdx ? 'bg-ink' : 'bg-hairline',
                    )}
                  />
                ) : (
                  <span aria-hidden className="flex-1" />
                )}
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full border-2 shrink-0 mx-2 transition-colors',
                    done && 'bg-ink border-ink text-paper',
                    isCurrent && 'bg-pink border-pink text-paper',
                    !reached && 'bg-paper border-hairline text-mute',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {done ? (
                    <Check size={12} strokeWidth={2.6} />
                  ) : (
                    <span className="font-mono text-[10px] font-semibold">{i + 1}</span>
                  )}
                </span>
                {/* Right connector */}
                {i < STAGES.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      'flex-1 h-px',
                      i < currentIdx ? 'bg-ink' : 'bg-hairline',
                    )}
                  />
                ) : (
                  <span aria-hidden className="flex-1" />
                )}
              </div>
              <div
                className={cn(
                  'text-[12px] uppercase tracking-widest font-medium font-mono leading-tight',
                  reached ? 'text-ink' : 'text-mute',
                )}
              >
                {stage.short}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
