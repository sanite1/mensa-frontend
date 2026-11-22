// /checkout/confirmation/:orderNumber, in the design system's centred result layout. Paid status arrives async via the Paystack webhook,
// so the page polls until payment.status settles. Guests enter their email once, kept in the URL.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { OrderSummaryCard } from '@/modules/platform/components/OrderSummaryCard'
import { FulfilmentTimeline } from '@/modules/platform/components/FulfilmentTimeline'

import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useTrackOrder, useVerifyCheckout } from '@/lib/network/api/order.api'
import { clearReferralCode } from '@/lib/referral'
import { useSeo } from '@/lib/seo'
import { cn } from '@/lib/utils'

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
  useSeo({
    title: orderNumber ? `Order ${orderNumber}` : 'Order confirmation',
    noindex: true,
  })
  const [params, setParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const clearCart = useCartStore((s) => s.clearCart)

  // Email resolution order: ?email= param, logged in user, then sessionStorage stash.
  // Hosted Paystack drops URL params, so the stash is what works after the redirect back.
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

  // Verify on return, backend pings Paystack directly so we don't depend on the webhook landing.
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

  // Poll as a fallback for when verify returned 'pending' but Paystack settles seconds later.
  useEffect(() => {
    if (!order || paymentStatus !== 'pending') return
    const id = setInterval(() => {
      // Skip while the tab is in the background.
      if (!document.hidden) refetch()
    }, 4000)
    // Stop polling after ~2 minutes regardless.
    const stop = setTimeout(() => clearInterval(id), 120_000)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [order, paymentStatus, refetch])

  // On paid: clear cart, stash, and referral code so unrelated future purchases stop crediting the partner.
  useEffect(() => {
    if (paymentStatus !== 'paid') return
    clearCart()
    clearReferralCode()
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
    const err = form.formState.errors.email
    return (
      <Shell>
        <span className="eyebrow">Order {orderNumber}</span>
        <h1 className="text-(length:--fs-h3)">Confirm your email</h1>
        <p className="lede max-w-[40ch]">
          Enter the email you used at checkout so we can pull up your order.
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmitEmail)}
          className="grid w-full max-w-sm gap-3 text-left"
          noValidate
        >
          <label className={cn('fld', err && 'is-invalid')}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(err)}
              {...form.register('email')}
            />
            {err ? <em>{err.message}</em> : null}
          </label>
          <button type="submit" className="btn">
            Show my order
          </button>
        </form>
      </Shell>
    )
  }

  if (trackQuery.isLoading) {
    return (
      <Shell>
        <span className="eyebrow">Order {orderNumber}</span>
        <h1 className="text-(length:--fs-h3)">Looking up your order…</h1>
      </Shell>
    )
  }

  if (trackQuery.isError || !order) {
    return (
      <Shell>
        <span className="eyebrow">Order {orderNumber}</span>
        <h1 className="text-(length:--fs-h3)">We couldn't find that order</h1>
        <p className="lede max-w-[40ch]">
          Check the email you used at checkout, or open the link in the confirmation email we sent
          you.
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setEmail('')
            setParams({}, { replace: true })
          }}
        >
          Try a different email
        </button>
      </Shell>
    )
  }

  const paid = order.payment.status === 'paid'
  const failed = order.payment.status === 'failed'
  const checking = !paid && !failed && (verify.isPending || trackQuery.isFetching)
  const firstName = order.address.fullName.split(' ')[0]

  return (
    <main className="wrap py-[clamp(4rem,10vw,7rem)]">
      <div className="mx-auto grid max-w-140 justify-items-center gap-5 text-center">
        <span className="eyebrow">
          {paid ? 'Payment received' : failed ? 'Not paid' : 'Checking with Paystack'}
        </span>
        <h1 className="text-(length:--fs-h2)">
          {paid
            ? `Thank you, ${firstName}!`
            : failed
              ? "Your payment didn't go through"
              : 'Confirming your payment…'}
        </h1>
        <p className="font-medium">Order {order.orderNumber}</p>
        <p className="lede max-w-[40ch]">
          {paid
            ? "Your order is paid and we're getting it ready in the studio. We'll email a tracking link the moment it leaves."
            : failed
              ? 'No money has left your account. You can try again whenever you are ready.'
              : 'This usually takes a few seconds. Leave this page open and it updates the moment Paystack responds.'}
        </p>
        {!paid && !failed ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => verify.mutate(orderNumber, { onSettled: () => refetch() })}
            disabled={verify.isPending}
          >
            {checking ? 'Checking…' : 'Check again now'}
          </button>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          {failed ? (
            <Link className="btn" to="/checkout">
              Return to checkout
            </Link>
          ) : null}
          {user ? (
            <Link className={failed ? 'btn btn--ghost' : 'btn'} to="/account/orders">
              View all orders
            </Link>
          ) : null}
          <Link className="btn btn--ghost" to="/shop">
            Keep shopping
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6">
        {/* The tracking timeline only makes sense once payment has cleared. */}
        {paid ? <FulfilmentTimeline order={order} /> : null}
        <OrderSummaryCard order={order} />
      </div>
    </main>
  )
}

/** The design's centred result frame. */
function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="wrap grid min-h-[60vh] place-items-center py-[clamp(4rem,10vw,8rem)]">
      <div className="grid max-w-140 justify-items-center gap-5 text-center">{children}</div>
    </main>
  )
}
