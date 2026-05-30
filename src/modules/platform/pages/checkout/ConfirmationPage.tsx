// ═══════════════════════════════════════════════════════════════
// /checkout/confirmation/:orderNumber
//
// Landing page after Paystack closes successfully. The actual
// "paid" status is set asynchronously by the Paystack webhook, so
// when this page first renders the order may still be in 'pending'
// state. We polling-refresh every few seconds until either
// payment.status flips to 'paid' (success), 'failed' (so we can
// tell the customer), or we hit a timeout.
//
// Auth flow: a logged-in user with a matching email gets the
// order auto-resolved. A guest must enter their email once (we
// remember it in the URL so refresh keeps working).
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
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
import { OrderSummaryCard } from '@/modules/platform/components/OrderSummaryCard'

import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useTrackOrder, useVerifyCheckout } from '@/lib/network/api/order.api'

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter the email you used at checkout.'),
})
type EmailValues = z.infer<typeof emailSchema>

export function ConfirmationPage() {
  const navigate = useNavigate()
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [params, setParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const clearCart = useCartStore((s) => s.clearCart)

  // We try, in order: ?email= on the URL, the logged-in user's email,
  // the email the customer entered at checkout (stashed in
  // sessionStorage before we redirected them to Paystack). The hosted
  // Paystack flow does not preserve URL params, so sessionStorage is
  // the path that "just works" after a successful redirect back.
  const urlEmail = params.get('email')?.trim() ?? ''
  const stashedEmail = useMemo(() => {
    if (!orderNumber) return ''
    try {
      return sessionStorage.getItem(`mensa-checkout-email:${orderNumber}`) ?? ''
    } catch {
      return ''
    }
  }, [orderNumber])

  const inferredEmail = useMemo(
    () => urlEmail || user?.email || stashedEmail || '',
    [urlEmail, user?.email, stashedEmail],
  )
  const [email, setEmail] = useState(inferredEmail)

  useEffect(() => {
    if (inferredEmail && inferredEmail !== email) setEmail(inferredEmail)
  }, [inferredEmail, email])

  const trackQuery = useTrackOrder(orderNumber, email)
  const order = trackQuery.data?.data?.order
  const paymentStatus = order?.payment.status
  const refetch = trackQuery.refetch

  // ── Verify-on-return ─────────────────────────────────────────────
  // On first paint with a known orderNumber, ask our backend to ping
  // Paystack directly. This collapses the wait-for-webhook latency to
  // a single round trip and works even when the webhook never lands.
  const verify = useVerifyCheckout()
  const verifyAttempted = useRef(false)

  useEffect(() => {
    if (!orderNumber || verifyAttempted.current) return
    verifyAttempted.current = true
    verify.mutate(orderNumber, {
      onSettled: () => {
        // Whatever Paystack said, pull the freshest order state down.
        refetch()
      },
    })
    // We deliberately only fire once per mount. Polling below covers
    // any case where Paystack itself is still settling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber])

  // Poll the public lookup as a fallback. Mostly catches the case where
  // the verify call returned 'pending' (Paystack hadn't yet settled in
  // their own DB) but does settle a few seconds later.
  useEffect(() => {
    if (!order || paymentStatus !== 'pending') return
    const id = setInterval(() => {
      refetch()
    }, 4000)
    // Stop polling after ~2 minutes regardless.
    const stop = setTimeout(() => clearInterval(id), 120_000)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [order, paymentStatus, refetch])

  // Once we have confirmation that the order is paid, drop the cart and
  // discard the stashed email. Both are one-shots tied to this orderNumber.
  useEffect(() => {
    if (paymentStatus !== 'paid') return
    clearCart()
    if (!orderNumber) return
    try {
      sessionStorage.removeItem(`mensa-checkout-email:${orderNumber}`)
    } catch {
      /* private mode etc — ignore */
    }
  }, [paymentStatus, clearCart, orderNumber])

  // ── Email gate ──
  const form = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })
  const onSubmitEmail = (values: EmailValues) => {
    setEmail(values.email)
    setParams({ email: values.email }, { replace: true })
  }

  if (!orderNumber) {
    navigate('/', { replace: true })
    return null
  }

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
            Order {orderNumber}
          </p>
          <h1 className="mt-2 font-serif italic text-3xl text-(--ink)">Confirm the email.</h1>
          <p className="mt-2 text-[14px] text-(--graphite)">
            Enter the email you used at checkout so we can pull up your order.
          </p>
        </header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitEmail)} className="flex flex-col gap-4">
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
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Show my order
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  if (trackQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[14px] text-(--mute)">
        Looking up order {orderNumber}…
      </div>
    )
  }

  if (trackQuery.isError || !order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
          Order {orderNumber}
        </p>
        <h1 className="mt-2 font-serif italic text-3xl text-(--ink)">
          We could not find that order.
        </h1>
        <p className="mt-2 text-[14px] text-(--graphite)">
          Double check the email you used at checkout, or paste the link from the confirmation we
          sent you.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            setEmail('')
            setParams({}, { replace: true })
          }}
        >
          Try a different email
        </Button>
      </div>
    )
  }

  const paid = order.payment.status === 'paid'
  const failed = order.payment.status === 'failed'
  const checking = !paid && !failed && (verify.isPending || trackQuery.isFetching)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="mb-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
          Order {order.orderNumber}
        </p>
        <h1 className="mt-2 font-serif italic text-4xl text-(--ink)">
          {paid
            ? `Thank you, ${order.address.fullName.split(' ')[0]}.`
            : failed
              ? 'Payment did not go through.'
              : 'Almost there…'}
        </h1>
        <p className="mt-3 text-[15px] text-(--graphite) max-w-xl mx-auto">
          {paid
            ? 'Your order is confirmed. We are getting it ready and will email a tracking link the moment it leaves our studio.'
            : failed
              ? 'We were not able to confirm your payment. Nothing was charged. You can try again whenever you are ready.'
              : 'We are checking with Paystack to confirm your payment. This usually takes a few seconds.'}
        </p>
        {!paid && !failed ? (
          <div className="mt-8 mx-auto flex flex-col items-center gap-5 px-6 py-7 max-w-md bg-cream-soft border border-hairline-soft">
            {/* Spinner — paper ring with a pink quadrant rotating on top.
                Tailwind's animate-spin handles the rotation; the border
                trick gives us a tidy spinner without an SVG dependency.
                The border-top-color uses an arbitrary class because we
                need it scoped to the top edge only, which has no shorthand. */}
            <div
              className="relative animate-spin w-12 h-12 rounded-full border-[3px] border-hairline border-t-pink"
              aria-hidden="true"
            />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="m-0 text-[11px] uppercase tracking-[0.14em] font-medium text-pink-deep">
                {checking ? 'Verifying with Paystack' : 'Awaiting confirmation'}
              </p>
              <p className="m-0 text-ink font-display italic text-[22px] leading-[1.2] tracking-[-0.01em]">
                Hold tight — confirming your payment.
              </p>
              <p className="m-0 mt-1 text-[13px] text-(--graphite) max-w-sm">
                This usually takes a second or two. You can leave this page open; we will update it
                the moment Paystack responds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (orderNumber) {
                  verify.mutate(orderNumber, { onSettled: () => refetch() })
                }
              }}
              disabled={verify.isPending}
              className="text-[12px] uppercase tracking-[0.12em] font-medium text-(--ink) underline underline-offset-4 disabled:opacity-50"
            >
              {verify.isPending ? 'Checking…' : 'Check again now'}
            </button>
          </div>
        ) : null}
      </header>

      <OrderSummaryCard order={order} />

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {failed ? (
          <Button asChild variant="primary" size="lg">
            <Link to="/checkout">Return to checkout</Link>
          </Button>
        ) : null}
        <Button asChild variant="secondary" size="lg">
          <Link to="/shop">Continue shopping</Link>
        </Button>
        {user ? (
          <Button asChild variant="secondary" size="lg">
            <Link to="/account/orders">View all orders</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
