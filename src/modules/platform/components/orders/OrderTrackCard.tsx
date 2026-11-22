// OrderTrackCard: the design system's order card. Headline for where the
// order is, the Placed, Paid, Shipped, Delivered rail, delivery details, and
// everything in the parcel. Used on /orders/track and the payment result page.
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useFormatPrice } from '@/lib/currency'
import { estimatedDelivery, shippingLabel } from '@/lib/tracking'
import type { Order } from '@/lib/network/types/order.types'

const day = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-NG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : ''

type Stage = 'pending' | 'paid' | 'packing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

function stageOf(o: Order): Stage {
  const pay = o.payment.status
  if (pay === 'refunded' || pay === 'partial_refund') return 'refunded'
  if (o.fulfilment.status === 'cancelled') return 'cancelled'
  if (pay !== 'paid') return 'pending'
  if (o.fulfilment.status === 'delivered') return 'delivered'
  if (o.fulfilment.status === 'shipped') return 'shipped'
  if (o.fulfilment.status === 'processing') return 'packing'
  return 'paid'
}

const HEADLINE: Record<Stage, { label: string; title: string; body: string }> = {
  pending: {
    label: 'Awaiting payment',
    title: 'Waiting for payment',
    body: "We've saved your order. It ships as soon as payment comes through.",
  },
  paid: {
    label: 'Paid',
    title: 'Payment received',
    body: 'Thank you. Our studio team will start packing your order shortly.',
  },
  packing: {
    label: 'Preparing',
    title: 'Being packed',
    body: "We're checking and packing your order in the studio in Abuja. You'll get an email the moment it ships.",
  },
  shipped: {
    label: 'Shipped',
    title: 'On its way',
    body: 'Your order has left the studio. The rider will call before delivery.',
  },
  delivered: {
    label: 'Delivered',
    title: 'Delivered',
    body: "Enjoy! Rinse cold, wash cool and line dry, and they'll last for years.",
  },
  cancelled: {
    label: 'Cancelled',
    title: 'Cancelled',
    body: 'This order was cancelled. If you were charged, the refund lands on the same card within 5 to 10 working days.',
  },
  refunded: {
    label: 'Refunded',
    title: 'Refunded',
    body: "We've refunded this order. Banks can take a few working days to show it.",
  },
}

const Tick = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 5 5 9-10" />
  </svg>
)

export function OrderTrackCard({ order: o }: { order: Order }) {
  const formatPrice = useFormatPrice()
  const stage = stageOf(o)
  const head = HEADLINE[stage]
  const stopped = stage === 'cancelled' || stage === 'refunded'
  const paid = o.payment.status === 'paid'
  const shipped = stage === 'shipped' || stage === 'delivered'
  const steps = [
    { label: 'Placed', at: o.createdAt, done: true },
    { label: 'Paid', at: o.payment.paidAt, done: paid },
    { label: 'Shipped', at: o.fulfilment.shippedAt, done: shipped },
    { label: 'Delivered', at: o.fulfilment.deliveredAt, done: stage === 'delivered' },
  ]
  const reached = steps.filter((s) => s.done).length
  const current = stopped || reached === 4 ? -1 : reached
  const eta = estimatedDelivery(o)
  const tracking = o.fulfilment.trackingCode

  return (
    <article className="tcard">
      <div className="tcard__head">
        <div>
          <span className="eyebrow">{head.label}</span>
          <h2>{head.title}</h2>
          <p>{head.body}</p>
        </div>
        <div className="tcard__ref">
          Order
          <b>{o.orderNumber}</b>
          {day(o.createdAt)}
        </div>
      </div>
      <div className="tcard__body">
        {!stopped ? (
          <ol
            className="steps"
            style={{ '--progress': (reached - 1) / 3 } as CSSProperties}
            aria-label="Order progress"
          >
            {steps.map((s, i) => (
              <li
                key={s.label}
                className={s.done ? 'is-done' : i === current ? 'is-current' : ''}
                aria-current={i === current ? 'step' : undefined}
              >
                <span className="steps__dot">
                  <Tick />
                </span>
                <b>{s.label}</b>
                <small>{s.done ? day(s.at) : i === current ? 'In progress' : ''}</small>
              </li>
            ))}
          </ol>
        ) : null}

        {stage === 'pending' ? (
          <div className="tstate">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            <div>
              <b>
                {o.payment.status === 'failed'
                  ? 'Payment did not go through'
                  : 'Payment not received yet'}
              </b>
              <p>
                {o.payment.authorizationUrl && o.payment.status !== 'failed'
                  ? "Finish paying securely with Paystack and we'll start packing straight away."
                  : 'No money has left your account. Place the order again from your bag, or email hi@mensaproducts.com and we will help.'}
              </p>
              {o.payment.authorizationUrl && o.payment.status !== 'failed' ? (
                <a className="btn" href={o.payment.authorizationUrl}>
                  Finish paying · {formatPrice(o.totals.total)}{' '}
                  <svg className="arrow" width="18" height="18">
                    <use href="#i-arrow" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        {stopped ? (
          <div className="tstate tstate--grey">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" />
            </svg>
            <div>
              <b>{head.title}</b>
              <p>
                Questions? Email <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> with
                your order number.
              </p>
            </div>
          </div>
        ) : null}

        <dl className="tmeta">
          <div>
            <dt>Delivering to</dt>
            <dd>{[o.address.city, o.address.state].filter(Boolean).join(', ') || 'Not set'}</dd>
          </div>
          <div>
            <dt>{eta ? (eta.anchoredToShip ? 'Arriving' : 'Estimated delivery') : 'Delivery'}</dt>
            <dd>{eta ? eta.label : shippingLabel(o)}</dd>
          </div>
          <div>
            <dt>Tracking number</dt>
            <dd>
              {tracking ? (
                o.fulfilment.trackingUrl ? (
                  <a href={o.fulfilment.trackingUrl} target="_blank" rel="noreferrer">
                    {tracking}
                  </a>
                ) : (
                  tracking
                )
              ) : shipped ? (
                'Sent by text'
              ) : (
                'Once it ships'
              )}
            </dd>
          </div>
        </dl>

        <div>
          <ul className="titems">
            {o.lines.map((l, k) => (
              <li key={l._id ?? k}>
                <span>
                  <b>
                    {l.qty} × {l.productName}
                  </b>
                  {l.variantLabel && l.variantLabel !== l.productName ? (
                    <small>{l.variantLabel}</small>
                  ) : null}
                </span>
                <span>{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="ttotals mt-4">
            <dt>Subtotal</dt>
            <dd>{formatPrice(o.totals.subtotal)}</dd>
            <dt>Delivery</dt>
            <dd>{o.totals.shipping ? formatPrice(o.totals.shipping) : 'Free'}</dd>
            {o.totals.discount > 0 ? (
              <>
                <dt>Discount{o.discountCode ? ` (${o.discountCode})` : ''}</dt>
                <dd>−{formatPrice(o.totals.discount)}</dd>
              </>
            ) : null}
            <dt className="is-total">Total</dt>
            <dd className="is-total">{formatPrice(o.totals.total)}</dd>
          </dl>
        </div>
        <p className="text-(length:--fs-sm) text-(--mute)">
          Something not right? Tell us within three days of delivery and we'll make it right.{' '}
          <Link to="/shop" className="text-(--berry)">
            Back to the shop
          </Link>
        </p>
      </div>
    </article>
  )
}
