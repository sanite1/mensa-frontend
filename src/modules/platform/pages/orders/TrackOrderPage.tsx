// /orders/track public tracker in the design system's layout, email acts as a soft PIN alongside the order number.
// Deep linkable via ?orderNumber=…&email=…, the orderShipped email links here prefilled.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { OrderTrackCard } from '@/modules/platform/components/orders/OrderTrackCard'

import { useTrackOrder } from '@/lib/network/api/order.api'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

const lookupSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^MS-\d{4}-\d{5}$/, 'Order numbers look like MS-2026-00001.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required.')
    .email('Please enter the email you used at checkout.'),
})
type LookupValues = z.infer<typeof lookupSchema>

const POLL_INTERVAL_MS = 60_000 // once a minute while the order is in flight
// Fulfilment moves in hours, not seconds. A tab left open on a shipped order
// would otherwise poll for days, so polling stops after this long.
const POLL_MAX_MS = 10 * 60_000

export function TrackOrderPage() {
  useSeo({
    title: 'Track your order',
    description:
      'Look up the status of any Mensa order with your order number and the email you used at checkout.',
  })
  const [params, setParams] = useSearchParams()

  // ── Initial values: prefer URL params so the email link works one-tap.
  const initialOrderNumber = (params.get('orderNumber') ?? '').toUpperCase()
  const initialEmail = (params.get('email') ?? '').toLowerCase()

  // `submitted` drives the actual query. When the user types and clicks
  // Find, OR when both URL params are present, we set this.
  const [submitted, setSubmitted] = useState<LookupValues | null>(() => {
    const parsed = lookupSchema.safeParse({
      orderNumber: initialOrderNumber,
      email: initialEmail,
    })
    return parsed.success ? parsed.data : null
  })

  const form = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      orderNumber: initialOrderNumber,
      email: initialEmail,
    },
  })

  const trackQuery = useTrackOrder(submitted?.orderNumber, submitted?.email, !!submitted)
  const order = trackQuery.data?.data?.order

  // ── Live polling while the order is still moving ──────────────────
  // Poll only for paid orders that haven't reached a terminal fulfilment state.
  const isInFlight =
    !!order &&
    order.payment.status === 'paid' &&
    order.fulfilment.status !== 'delivered' &&
    order.fulfilment.status !== 'cancelled'

  const refetch = trackQuery.refetch
  useEffect(() => {
    if (!isInFlight) return
    const startedAt = Date.now()
    const id = setInterval(() => {
      if (Date.now() - startedAt > POLL_MAX_MS) {
        clearInterval(id)
        return
      }
      // Skip while the tab is in the background, nobody is looking at it.
      if (document.hidden) return
      refetch()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isInFlight, refetch])

  // ── Keep the URL in sync with the looked-up values ────────────────
  // Written only on form submit so refresh, share, and history feel sensible.
  const lastSyncedRef = useRef<string>('')
  useEffect(() => {
    if (!submitted) return
    const next = `${submitted.orderNumber}|${submitted.email}`
    if (next === lastSyncedRef.current) return
    lastSyncedRef.current = next
    setParams({ orderNumber: submitted.orderNumber, email: submitted.email }, { replace: true })
  }, [submitted, setParams])

  const onSubmit = (values: LookupValues) => setSubmitted(values)

  const onReset = () => {
    setSubmitted(null)
    setParams({}, { replace: true })
    form.reset({ orderNumber: '', email: '' })
  }

  // useTrackOrder returns isError on 404, treated as "not found" rather than a generic failure.
  const lookupFailed = !!submitted && trackQuery.isError
  const lookupLoading = !!submitted && trackQuery.isFetching && !order
  const errors = form.formState.errors
  const numberField = form.register('orderNumber')

  return (
    <main>
      <header className="fhero">
        <div className="wrap fhero__inner">
          <div>
            <span className="eyebrow">Order status</span>
            <h1 className="split">
              <span className="split-line">
                <span>Where's my</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>
                  <span className="accent">order?</span>
                </span>
              </span>
            </h1>
          </div>
          <p className="lede">
            Enter your order number and the email you used at checkout. Your number starts with MS
            and is in the confirmation email we sent you.
          </p>
        </div>
      </header>

      <section className="wrap track">
        <div className="track__grid">
          <form className="track__form mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div>
              <h2>Find your order</h2>
              <p>We'll show you exactly where it is, and this page updates as it moves.</p>
            </div>
            <label className={cn('mfield', errors.orderNumber && 'is-invalid')}>
              <span>Order number</span>
              <input
                placeholder="MS-2026-00001"
                autoCapitalize="characters"
                autoComplete="off"
                {...numberField}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                  numberField.onChange(e)
                }}
              />
              {errors.orderNumber ? <em>{errors.orderNumber.message}</em> : null}
            </label>
            <label className={cn('mfield', errors.email && 'is-invalid')}>
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...form.register('email')}
              />
              {errors.email ? <em>{errors.email.message}</em> : null}
            </label>
            {lookupFailed ? (
              <p className="mform__error" role="alert">
                We couldn't match that order number and email. Both need to be exactly what you used
                at checkout.
              </p>
            ) : null}
            <button className="btn" type="submit" disabled={lookupLoading}>
              {lookupLoading ? (
                'Looking…'
              ) : (
                <>
                  {order ? 'Refresh' : 'Track order'}{' '}
                  <svg className="arrow" width="18" height="18">
                    <use href="#i-arrow" />
                  </svg>
                </>
              )}
            </button>
            {submitted ? (
              <button type="button" className="btn btn--ghost" onClick={onReset}>
                Look up a different order
              </button>
            ) : null}
            <div className="track__help">
              <span>Can't find your number?</span>
              <span>
                Check the confirmation email we sent at checkout, or email{' '}
                <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> and we'll find it.
              </span>
            </div>
          </form>

          <div aria-live="polite">
            {order ? (
              <OrderTrackCard order={order} />
            ) : (
              <div className="track__placeholder">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
                  <circle cx="7" cy="18" r="1.6" />
                  <circle cx="17" cy="18" r="1.6" />
                </svg>
                <h3>{lookupLoading ? 'Checking the studio…' : 'Your order will show here'}</h3>
                <p>Status, delivery details and everything in the parcel.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
