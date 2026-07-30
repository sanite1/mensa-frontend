// /orders/track public tracker, email acts as a soft PIN alongside the order number.
// Deep linkable via ?orderNumber=…&email=…, the orderShipped email links here prefilled.

import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FulfilmentTimeline } from '@/modules/platform/components/FulfilmentTimeline'

import { useTrackOrder } from '@/lib/network/api/order.api'
import { useSeo } from '@/lib/seo'

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

const POLL_INTERVAL_MS = 30_000 // 30s while the order is in flight

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
    const id = setInterval(() => {
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
  const lookupSucceeded = !!submitted && !!order
  const lookupLoading = !!submitted && trackQuery.isFetching && !order

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-widest text-mute font-medium font-mono">
          Track your order
        </p>
        <h1 className="m-0 mt-3 font-display italic font-semibold text-[clamp(32px,5vw,52px)] leading-tight tracking-tight text-ink">
          Where is my order?
        </h1>
        <p className="mt-3 t-body text-graphite max-w-150">
          Enter the order number and email you used at checkout. We will show you the latest status,
          and this page updates itself as your order moves.
        </p>
      </header>

      {/* Lookup form */}
      <div className="border border-hairline bg-paper p-6 lg:p-8 mb-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end"
          >
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Order number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MS-2026-00001"
                      autoCapitalize="characters"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" size="lg" disabled={lookupLoading}>
                {lookupLoading ? 'Looking up…' : lookupSucceeded ? 'Refresh' : 'Find my order'}
              </Button>
              {submitted ? (
                <Button type="button" variant="ghost" size="md" onClick={onReset}>
                  Look up a different order
                </Button>
              ) : null}
            </div>
          </form>
        </Form>
      </div>

      {/* Results / states */}
      {lookupLoading ? (
        <div className="border border-hairline bg-paper p-6 t-body-s text-mute">
          Looking up {submitted?.orderNumber}…
        </div>
      ) : null}

      {lookupFailed ? <NotFoundPanel /> : null}

      {lookupSucceeded && order ? <FulfilmentTimeline order={order} /> : null}

      {/* Help footer */}
      {!submitted ? (
        <p className="mt-6 t-body-s text-mute">
          Lost the order number? Check the confirmation email we sent at checkout, or{' '}
          <Link to="/" className="text-ink underline underline-offset-4">
            email us
          </Link>{' '}
          and we will find it.
        </p>
      ) : null}
    </div>
  )
}

function NotFoundPanel() {
  return (
    <div className="border border-coral/50 bg-blush p-5 lg:p-6 flex flex-col gap-2">
      <div className="t-eyebrow text-coral">Not found</div>
      <p className="m-0 text-[14.5px] text-berry leading-relaxed">
        We could not match that order number and email. Both fields must be exactly what you used at
        checkout. Double check the confirmation email we sent. If it still does not work, reach us
        at hi@mensaproducts.com and we will sort it out.
      </p>
    </div>
  )
}
