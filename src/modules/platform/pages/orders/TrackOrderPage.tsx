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
            <span className="eyebrow">Track your order</span>
            <h1 className="split">
              <span className="split-line">
                <span>Where is my</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>
                  <span className="accent">order?</span>
                </span>
              </span>
            </h1>
          </div>
          <p className="lede">
            Enter the order number and email you used at checkout. We will show you the latest
            status, and this page updates itself as your order moves.
          </p>
        </div>
      </header>

      <section className="wrap track">
        <div className="track__grid">
          <form className="track__form mform" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
              <div className="mform__error" role="alert">
                <b>Not found</b>
                <p>
                  We could not match that order number and email. Both fields must be exactly what
                  you used at checkout. Double check the confirmation email we sent. If it still
                  does not work, reach us at hi@mensaproducts.com and we will sort it out.
                </p>
              </div>
            ) : null}
            <button className="btn" type="submit" disabled={lookupLoading}>
              {lookupLoading ? (
                'Looking up…'
              ) : (
                <>
                  {order ? 'Refresh' : 'Find my order'}{' '}
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
            {!submitted ? (
              <div className="track__help">
                <span>
                  Lost the order number? Check the confirmation email we sent at checkout, or{' '}
                  <a href="mailto:hi@mensaproducts.com">email us</a> and we will find it.
                </span>
              </div>
            ) : null}
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
                {lookupLoading ? <h3>Looking up {submitted?.orderNumber}…</h3> : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
