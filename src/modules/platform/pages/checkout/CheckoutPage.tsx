// /checkout: the design system's checkout. Numbered Contact, Delivery and
// Payment steps on the left, the order summary on the right. Our extras are
// kept: saved addresses for signed in customers, live delivery options from
// the backend, discount codes, referral codes and the NGN charge note.
// useInitializeCheckout reserves stock and returns the Paystack handoff; on
// cancel the webhook releases the stock, so we only toast here.

import { useEffect, useMemo, useRef, useState, type InputHTMLAttributes } from 'react'
import { useForm, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { addressSchema } from '@/modules/platform/components/AddressForm'
import { NG_STATES } from '@/data/nigerian-states'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useInitializeCheckout, useShippingRates } from '@/lib/network/api/order.api'
import { getReferralCode } from '@/lib/referral'
import { useApplyDiscount } from '@/lib/network/api/discount.api'
import type { ApplyDiscountResponseData } from '@/lib/network/types/discount.types'
import { useAddMyAddress, useMyAddresses } from '@/lib/network/api/user.api'
import type { UserAddress } from '@/lib/network/types/user.types'
import type { ShippingMethod, ShippingRateOption } from '@/lib/network/types/order.types'
import { useFormatPrice } from '@/lib/currency'
import { useCurrencyStore } from '@/lib/network/stores/currency.store'
import { useSeo } from '@/lib/seo'
import { handleApiError } from '@/lib/network/helpers/handleApiError'
import { cn } from '@/lib/utils'

const checkoutSchema = z.object({
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter a valid email address.'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.'),
  address: addressSchema,
  saveAddress: z.boolean().optional(),
})

type CheckoutValues = z.infer<typeof checkoutSchema>

/** Selectable card used for saved addresses and delivery options. */
const OPTION = 'w-full text-left rounded-(--r-md) border px-4 py-3.5 transition-colors bg-(--paper)'
const optionState = (on: boolean) =>
  on ? 'border-(--ink) shadow-[inset_0_0_0_1px_var(--ink)]' : 'border-(--line) hover:border-(--ink)'

export function CheckoutPage() {
  useSeo({ title: 'Checkout', noindex: true })
  const lines = useCartStore((s) => s.lines)
  const subtotalKobo = useCartStore((s) => s.subtotal())
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = !!user

  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [paying, setPaying] = useState(false)
  const initialize = useInitializeCheckout()
  const formatPrice = useFormatPrice()
  const displayCurrency = useCurrencyStore((s) => s.currency)
  // Paystack always charges in NGN, warn visitors viewing another currency.
  const showCurrencyNote = displayCurrency !== 'NGN'

  // `applied` is the server confirmed preview, kept apart from the input so edits don't drop it.
  const [codeInput, setCodeInput] = useState('')
  const [applied, setApplied] = useState<ApplyDiscountResponseData | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const applyDiscount = useApplyDiscount()

  // Saved addresses, signed in customers only. Selecting one prefills the fields.
  const addressesQuery = useMyAddresses(isAuthenticated)
  const savedAddresses: UserAddress[] = addressesQuery.data?.data?.addresses ?? []
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)
  const addAddress = useAddMyAddress({ silent: true })

  // Pick the default saved address once, when the addresses query resolves.
  const autoPickedRef = useRef(false)
  useEffect(() => {
    if (!isAuthenticated || autoPickedRef.current) return
    if (!addressesQuery.data) return
    autoPickedRef.current = true
    if (savedAddresses.length === 0) {
      setSelectedAddressId('new')
      return
    }
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]
    setSelectedAddressId(def._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesQuery.data, isAuthenticated])

  const blankAddress = {
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'NG',
    postal: '',
  }

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerEmail: user?.email ?? '',
      customerPhone: user?.phone ?? '',
      address: blankAddress,
      saveAddress: true,
    },
  })
  const { register } = form
  const errors = form.formState.errors

  // Prefill the address whenever a saved one is picked. Email and phone stay, they live on the user.
  useEffect(() => {
    if (!selectedAddressId || selectedAddressId === 'new') return
    const picked = savedAddresses.find((a) => a._id === selectedAddressId)
    if (!picked) return
    form.setValue('address', {
      fullName: picked.fullName,
      phone: picked.phone,
      line1: picked.line1,
      line2: picked.line2 ?? '',
      city: picked.city,
      state: picked.state,
      country: picked.country || 'NG',
      postal: picked.postal ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId])

  const watchedState = form.watch('address.state')
  const watchedCity = form.watch('address.city')

  // Delivery is priced by state only. The city just has to be filled in before
  // options show; it is not sent, so typing it never triggers a fetch.
  const cityReady = (watchedCity ?? '').trim().length >= 2
  const shippingPayload = useMemo(() => {
    if (!watchedState || !cityReady || lines.length === 0) return undefined
    return {
      lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
      destination: { state: watchedState, country: 'NG' },
    }
  }, [cityReady, watchedState, lines])

  const ratesQuery = useShippingRates(shippingPayload)
  const rateOptions: ShippingRateOption[] = useMemo(
    () => ratesQuery.data?.data?.options ?? [],
    [ratesQuery.data],
  )

  // Keep the chosen method when it is still offered, otherwise take the first.
  useEffect(() => {
    if (rateOptions.length === 0) {
      setSelectedMethod(null)
      return
    }
    setSelectedMethod((prev) =>
      prev && rateOptions.some((o) => o.method === prev) ? prev : rateOptions[0].method,
    )
  }, [rateOptions])

  const selectedRate = rateOptions.find((o) => o.method === selectedMethod) ?? null
  const shippingKobo = selectedRate?.amount ?? 0
  const discountKobo = applied ? Math.min(applied.discountKobo, subtotalKobo) : 0
  const totalKobo = Math.max(0, subtotalKobo + shippingKobo - discountKobo)

  const onApplyCode = () => {
    const trimmed = codeInput.trim()
    if (!trimmed) return
    setDiscountError(null)
    applyDiscount.mutate(
      {
        code: trimmed,
        subtotal: subtotalKobo,
        email: form.getValues('customerEmail'),
        lines: lines.map((l) => ({ qty: l.qty })),
      },
      {
        onSuccess: (res) => {
          if (res.data) {
            setApplied(res.data)
            toast.success(`${res.data.description} applied.`)
          }
        },
        onError: (error) => {
          setApplied(null)
          setDiscountError(handleApiError(error).message)
        },
      },
    )
  }

  // Paystack's hosted checkout, not the inline modal, so the redirect survives popup blockers.
  // The cart is cleared on the confirmation page once the order is seen paid.
  const onSubmit = async (values: CheckoutValues) => {
    if (!selectedRate) {
      toast.error('Pick a delivery option to continue.')
      return
    }
    setPaying(true)
    try {
      const init = await initialize.mutateAsync({
        lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
        address: values.address,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        shippingMethod: selectedRate.method,
        shippingAmount: selectedRate.amount,
        discountCode: applied?.code,
        referralCode: getReferralCode() ?? undefined,
      })
      const data = init.data
      if (!data || !data.authorizationUrl) {
        toast.error('Could not start the payment. Please try again.')
        setPaying(false)
        return
      }

      // The confirmation page reads this to find the order without a retype.
      try {
        sessionStorage.setItem(`mensa-checkout-email:${data.orderNumber}`, values.customerEmail)
      } catch {
        // sessionStorage can throw in private modes; not worth blocking on.
      }

      // Opt in address save, not awaited. The backend dedupes.
      if (isAuthenticated && values.saveAddress && selectedAddressId === 'new') {
        addAddress.mutate({ ...values.address })
      }

      window.location.href = data.authorizationUrl
    } catch (error) {
      toast.error(handleApiError(error).message)
      setPaying(false)
    }
  }

  const onInvalid = () => {
    requestAnimationFrame(() =>
      document
        .querySelector('.checkout .is-invalid')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    )
  }

  if (lines.length === 0)
    return (
      <main className="wrap checkout-empty">
        <span className="eyebrow">Checkout</span>
        <h1>Your bag is empty.</h1>
        <p className="lede">Add something you love and come back here to pay.</p>
        <Link className="btn" to="/shop">
          Shop everything{' '}
          <svg className="arrow" width="18" height="18">
            <use href="#i-arrow" />
          </svg>
        </Link>
      </main>
    )

  const showAddressFields =
    !isAuthenticated || savedAddresses.length === 0 || selectedAddressId === 'new'
  const busy = paying || initialize.isPending

  return (
    <main className="checkout">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">Checkout</span>
        </nav>
        <div className="checkout__grid">
          <form
            className="checkout__form"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            noValidate
          >
            <h1>Checkout</h1>

            <section>
              <h2>
                <span>1</span>Contact
              </h2>
              <div className="fgrid">
                <Fld
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  hint="For your receipt and delivery updates."
                  error={errors.customerEmail}
                  {...register('customerEmail')}
                />
                <Fld
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0803 000 0000"
                  hint="The rider calls this number."
                  error={errors.customerPhone}
                  {...register('customerPhone')}
                />
              </div>
              {!isAuthenticated ? (
                <p className="checkout__fine mt-3 text-left">
                  Have an account? <Link to="/login">Sign in</Link> to fill this in for you.
                </p>
              ) : null}
            </section>

            <section>
              <h2>
                <span>2</span>Delivery
              </h2>

              {isAuthenticated && savedAddresses.length > 0 ? (
                <div className="mb-5 grid gap-2">
                  {savedAddresses.map((a) => (
                    <button
                      type="button"
                      key={a._id}
                      onClick={() => setSelectedAddressId(a._id)}
                      className={cn(OPTION, optionState(selectedAddressId === a._id))}
                    >
                      <span className="flex items-center gap-2">
                        <b className="font-medium text-(--ink)">{a.label || a.fullName}</b>
                        {a.isDefault ? <span className="pbadge">Default</span> : null}
                      </span>
                      <span className="mt-1 block text-[13px] text-(--mute)">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ''} · {a.city}, {a.state}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId('new')
                      form.setValue('address', blankAddress)
                      form.setValue('saveAddress', true)
                    }}
                    className={cn(
                      OPTION,
                      'border-dashed',
                      optionState(selectedAddressId === 'new'),
                    )}
                  >
                    <b className="font-medium text-(--ink)">Enter a new address</b>
                  </button>
                </div>
              ) : null}

              {showAddressFields ? (
                <div className="fgrid">
                  <Fld
                    label="Full name"
                    autoComplete="name"
                    error={errors.address?.fullName}
                    {...register('address.fullName')}
                  />
                  <Fld
                    label="Recipient phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="0801 234 5678"
                    error={errors.address?.phone}
                    {...register('address.phone')}
                  />
                  <Fld
                    label="Street address"
                    wide
                    autoComplete="address-line1"
                    placeholder="12 Aminu Kano Crescent"
                    error={errors.address?.line1}
                    {...register('address.line1')}
                  />
                  <Fld
                    label="Flat, landmark or gate code"
                    optional
                    wide
                    autoComplete="address-line2"
                    error={errors.address?.line2}
                    {...register('address.line2')}
                  />
                  <Fld
                    label="City or town"
                    autoComplete="address-level2"
                    error={errors.address?.city}
                    {...register('address.city')}
                  />
                  <label className={cn('fld', errors.address?.state && 'is-invalid')}>
                    <span>State</span>
                    <select autoComplete="address-level1" {...register('address.state')}>
                      <option value="">Choose…</option>
                      {NG_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.address?.state ? <em>{errors.address.state.message}</em> : null}
                  </label>
                  <Fld
                    label="Postcode"
                    optional
                    autoComplete="postal-code"
                    error={errors.address?.postal}
                    {...register('address.postal')}
                  />
                </div>
              ) : null}

              {isAuthenticated && selectedAddressId === 'new' ? (
                <label className="check mt-4">
                  <input type="checkbox" {...register('saveAddress')} />
                  <span>Save this address to my account for next time.</span>
                </label>
              ) : null}

              <div className="mt-6 grid gap-2">
                {!watchedState || !cityReady ? (
                  <p className="checkout__eta">
                    Enter your city and state to see delivery options.
                  </p>
                ) : ratesQuery.isLoading ? (
                  <p className="checkout__eta">Looking up delivery to {watchedState}…</p>
                ) : ratesQuery.isError ? (
                  <p className="checkout__error" role="alert">
                    We could not load delivery options. Try another state or refresh.
                  </p>
                ) : rateOptions.length === 0 ? (
                  <p className="checkout__error" role="alert">
                    We do not deliver to {watchedState} yet. Write to support@mensaproducts.com and
                    we will see what we can do.
                  </p>
                ) : (
                  rateOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.method}
                      onClick={() => setSelectedMethod(opt.method)}
                      className={cn(
                        OPTION,
                        'flex items-center justify-between gap-3',
                        optionState(selectedMethod === opt.method),
                      )}
                    >
                      <span>
                        <b className="block font-medium text-(--ink)">{opt.name}</b>
                        <span className="text-[13px] text-(--mute)">Arrives in {opt.eta}</span>
                      </span>
                      <b className="font-semibold text-(--ink)">
                        {opt.amount === 0 ? 'Free' : formatPrice(opt.amount)}
                      </b>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <h2>
                <span>3</span>Payment
              </h2>
              <div className="paybox">
                <div>
                  <b>Pay securely with Paystack</b>
                  <p>
                    Card, bank transfer or USSD. You finish paying on Paystack's page and come
                    straight back here.
                  </p>
                </div>
                <ul aria-label="Payment options">
                  <li>Card</li>
                  <li>Transfer</li>
                  <li>USSD</li>
                </ul>
              </div>
              {showCurrencyNote ? (
                <p className="checkout__fine mt-3 text-left">
                  Prices are shown in {displayCurrency}. Paystack charges{' '}
                  <b>₦{(totalKobo / 100).toLocaleString('en-NG')}</b> in naira, and your bank may
                  add a foreign exchange fee.
                </p>
              ) : null}
            </section>

            <button className="btn checkout__pay" type="submit" disabled={busy || !selectedRate}>
              {busy ? (
                'Opening Paystack…'
              ) : (
                <>
                  Pay {formatPrice(totalKobo)}{' '}
                  <svg className="arrow" width="18" height="18">
                    <use href="#i-arrow" />
                  </svg>
                </>
              )}
            </button>
            <p className="checkout__fine">
              Your items are held for you while you pay. We never store your card.
            </p>
          </form>

          <aside className="summary">
            <h2>Order summary</h2>
            <ul>
              {lines.map((l) => (
                <li key={l.variantId}>
                  <span className="summary__img">
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt="" className="absolute inset-0 size-full" />
                    ) : null}
                    <i>{l.qty}</i>
                  </span>
                  <span className="summary__name">
                    <b>{l.productName}</b>
                    {l.variantLabel && l.variantLabel !== l.productName ? (
                      <small>{l.variantLabel}</small>
                    ) : null}
                  </span>
                  <span className="summary__price">{formatPrice(l.unitPrice * l.qty)}</span>
                </li>
              ))}
            </ul>

            <DiscountEntry
              applied={applied}
              codeInput={codeInput}
              setCodeInput={setCodeInput}
              discountError={discountError}
              isApplying={applyDiscount.isPending}
              onApply={onApplyCode}
              onRemove={() => {
                setApplied(null)
                setCodeInput('')
                setDiscountError(null)
              }}
            />

            <dl>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotalKobo)}</dd>
              <dt>Delivery</dt>
              <dd>
                {selectedRate ? (
                  shippingKobo === 0 ? (
                    'Free'
                  ) : (
                    formatPrice(shippingKobo)
                  )
                ) : (
                  <small>Enter your address</small>
                )}
              </dd>
              {discountKobo > 0 ? (
                <>
                  <dt>Discount ({applied?.code})</dt>
                  <dd className="text-(--berry)">−{formatPrice(discountKobo)}</dd>
                </>
              ) : null}
              <dt className="summary__total">Total</dt>
              <dd className="summary__total">{formatPrice(totalKobo)}</dd>
            </dl>
          </aside>
        </div>
      </div>
    </main>
  )
}

/** The design's labelled field, wired to react-hook-form's register(). */
function Fld({
  label,
  error,
  hint,
  wide,
  optional,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: FieldError
  hint?: string
  wide?: boolean
  optional?: boolean
}) {
  return (
    <label className={cn('fld', wide && 'fld--wide', error && 'is-invalid')}>
      <span>
        {label}
        {optional ? <small> (optional)</small> : null}
      </span>
      <input {...rest} aria-invalid={Boolean(error)} />
      {error ? <em>{error.message}</em> : hint ? <small>{hint}</small> : null}
    </label>
  )
}

/** Collapsible "Have a code?" row; an applied code shows with a Remove link. */
function DiscountEntry({
  applied,
  codeInput,
  setCodeInput,
  discountError,
  isApplying,
  onApply,
  onRemove,
}: {
  applied: ApplyDiscountResponseData | null
  codeInput: string
  setCodeInput: (v: string) => void
  discountError: string | null
  isApplying: boolean
  onApply: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-(--line) py-4 text-[14px]">
        <span className="min-w-0 truncate">
          <b className="font-medium">{applied.code}</b>{' '}
          <span className="text-(--mute)">· {applied.description}</span>
        </span>
        <button type="button" onClick={onRemove} className="shrink-0 text-[13px] underline">
          Remove
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="border-t border-(--line) py-4">
        <button type="button" onClick={() => setOpen(true)} className="text-[14px] underline">
          Have a discount code?
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-2 border-t border-(--line) py-4">
      <div className={cn('fld', discountError && 'is-invalid')}>
        <span>Discount code</span>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="SWITCH10"
            aria-label="Discount code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onApply()
              }
            }}
          />
          <button
            type="button"
            className="btn btn--ghost"
            disabled={isApplying || codeInput.trim().length === 0}
            onClick={onApply}
          >
            {isApplying ? 'Checking…' : 'Apply'}
          </button>
        </div>
        {discountError ? <em>{discountError}</em> : null}
      </div>
    </div>
  )
}
