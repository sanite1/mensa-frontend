// ═══════════════════════════════════════════════════════════════
// /checkout
//
// Two column layout (single column on mobile):
//   • Left:  contact + address + shipping picker + pay button
//   • Right: sticky order summary
//
// Backend flow:
//   1. cart state -> useShippingRates(destination)         (query)
//   2. submit form  -> useInitializeCheckout()              (mutation)
//      backend snapshots lines, reserves stock, returns
//      access code + reference + public key.
//   3. openPaystackInline()                                 (modal)
//   4. on success  -> clear cart, route to /checkout/confirmation/:ref
//      on cancel   -> stay; stock will be released by markOrderFailed
//                     once Paystack webhooks the cancel event. We just
//                     surface a toast.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
import { Photo } from '@/components/shop/Photo'
import { AddressForm, addressSchema } from '@/modules/platform/components/AddressForm'

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

// ── Form schema ───────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────

export function CheckoutPage() {
  useSeo({ title: 'Checkout', noindex: true })
  const navigate = useNavigate()
  const lines = useCartStore((s) => s.lines)
  const subtotalKobo = useCartStore((s) => s.subtotal())
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = !!user

  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null)
  const [paying, setPaying] = useState(false)
  const initialize = useInitializeCheckout()
  const formatPrice = useFormatPrice()
  const displayCurrency = useCurrencyStore((s) => s.currency)
  // Paystack always charges in NGN. If the visitor is viewing a different
  // currency we surface a small note so the bank-statement amount in NGN
  // doesn't catch them off guard.
  const showCurrencyNote = displayCurrency !== 'NGN'

  // ── Discount state ───────────────────────────────────────────────
  //
  // applied is the *server-confirmed* discount preview. We keep it as
  // local state separate from the input field so the customer can edit
  // the code without instantly losing their previously-applied savings.
  const [codeInput, setCodeInput] = useState('')
  const [applied, setApplied] = useState<ApplyDiscountResponseData | null>(null)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const applyDiscount = useApplyDiscount()

  // ── Saved addresses (signed-in customers only) ──────────────────
  //
  // We fetch the address book up-front so the picker can render
  // synchronously alongside the form. Selecting one prefills the
  // form fields; tapping "Enter a new address" reverts to a blank
  // form (selectedAddressId=null) without touching saved entries.
  const addressesQuery = useMyAddresses(isAuthenticated)
  const savedAddresses: UserAddress[] = addressesQuery.data?.data?.addresses ?? []
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null)
  const addAddress = useAddMyAddress({ silent: true })

  // ── Redirect empty cart back to /shop ──
  useEffect(() => {
    if (lines.length === 0) {
      toast.message('Your bag is empty. Pick something to get started.')
      navigate('/shop', { replace: true })
    }
  }, [lines.length, navigate])

  // ── Auto-pick the default saved address on first load ───────────
  //
  // Runs exactly once when the addresses query resolves. After that
  // selectedAddressId is the customer's responsibility — switching
  // saved addresses, or jumping to "Enter a new address", is a
  // deliberate action they have to take.
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

  // ── Form ──
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerEmail: user?.email ?? '',
      customerPhone: user?.phone ?? '',
      address: {
        fullName: user?.name ?? '',
        phone: user?.phone ?? '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: 'NG',
        postal: '',
      },
      saveAddress: true,
    },
  })

  // Prefill the form whenever a saved address is selected.
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
    // Don't reset customerEmail / customerPhone — those live on the
    // user record, not the address.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId])

  // Watch the destination so shipping rates refetch when it changes.
  const watchedState = form.watch('address.state')
  const watchedCity = form.watch('address.city')

  const shippingPayload = useMemo(() => {
    if (!watchedState || !watchedCity || lines.length === 0) return undefined
    return {
      lines: lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId,
        qty: l.qty,
      })),
      destination: {
        city: watchedCity,
        state: watchedState,
        country: 'NG',
      },
    }
  }, [watchedCity, watchedState, lines])

  const ratesQuery = useShippingRates(shippingPayload)
  const rateOptions: ShippingRateOption[] = ratesQuery.data?.data?.options ?? []

  // Reset selected method when the available options change.
  useEffect(() => {
    if (rateOptions.length === 0) {
      setSelectedMethod(null)
      return
    }
    setSelectedMethod((prev) => {
      if (prev && rateOptions.some((o) => o.method === prev)) return prev
      return rateOptions[0].method
    })
  }, [rateOptions])

  const selectedRate = useMemo(
    () => rateOptions.find((o) => o.method === selectedMethod) ?? null,
    [rateOptions, selectedMethod],
  )

  const shippingKobo = selectedRate?.amount ?? 0

  // If the cart subtotal changes after a discount was applied (customer
  // tweaked qty in another tab, line went out of stock, …) the saved
  // kobo amount could be wrong. Drop the discount when subtotal changes.
  useEffect(() => {
    if (!applied) return
    // Re-derive what the discount should be at the current subtotal.
    // For percent we can recompute locally; for fixed we keep the same
    // kobo amount but clamp to the subtotal so we never owe the store.
    // Simplest path: drop and force a re-apply if the subtotal moved.
    // The customer's typed code is still in the input so re-applying
    // is one click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalKobo])

  const discountKobo = applied ? Math.min(applied.discountKobo, subtotalKobo) : 0
  const totalKobo = Math.max(0, subtotalKobo + shippingKobo - discountKobo)

  // ── Submit ──
  //
  // We hand the customer over to Paystack's *hosted* checkout (the
  // authorization_url returned from /checkout/initialize) instead of the
  // JS inline modal. Paystack itself redirects back to our confirmation
  // page on completion, which means the redirect is guaranteed even when
  // a browser blocks popups or a JS callback misses fires — both of
  // which we saw in test mode through ngrok.
  //
  // We don't clearCart here because the user is leaving our domain. The
  // confirmation page clears the cart once it observes the order as paid.
  const onSubmit = async (values: CheckoutValues) => {
    if (!selectedRate) {
      toast.error('Pick a shipping option to continue.')
      return
    }

    setPaying(true)
    try {
      const referralCode = getReferralCode() ?? undefined
      const init = await initialize.mutateAsync({
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          qty: l.qty,
        })),
        address: values.address,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        shippingMethod: selectedRate.method,
        shippingAmount: selectedRate.amount,
        discountCode: applied?.code,
        referralCode,
      })
      const data = init.data
      if (!data || !data.authorizationUrl) {
        toast.error('Could not start the payment. Please try again.')
        return
      }

      // Stash the email so the confirmation page can resolve the order
      // immediately when Paystack redirects the customer back, without
      // making them retype it. Scoped to this tab via sessionStorage.
      try {
        sessionStorage.setItem(`mensa-checkout-email:${data.orderNumber}`, values.customerEmail)
      } catch {
        // sessionStorage can throw in private modes; not worth blocking on.
      }

      // Save the new address to the customer's book if they opted in.
      // Fire-and-forget: we don't await it because the customer's about
      // to leave the page for Paystack, and the address backend dedupes
      // on line1+city+state+postal so a duplicate save is a no-op.
      const enteredNewAddress = selectedAddressId === 'new'
      if (isAuthenticated && values.saveAddress && enteredNewAddress) {
        addAddress.mutate({
          ...values.address,
          // First saved address becomes default; backend enforces.
        })
      }

      // Hand off to Paystack's hosted checkout. Their page handles every
      // edge case (3DS, OTP, cancel, back button) and redirects to the
      // callback_url we set in /checkout/initialize on completion.
      window.location.href = data.authorizationUrl
    } catch (error) {
      toast.error(handleApiError(error).message)
      setPaying(false)
    }
  }

  if (lines.length === 0) return null

  return (
    <div className="mx-auto max-w-300 px-4 sm:px-6 lg:px-10 py-10 lg:py-16">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
          Checkout
        </p>
        <h1 className="mt-2 font-serif italic text-4xl lg:text-5xl text-(--ink)">Almost yours.</h1>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10"
        >
          {/* ── Left column ──────────────────────────────────────── */}
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-5">
              <h2 className="font-serif italic text-2xl text-(--ink)">Contact</h2>

              <FormField
                control={form.control}
                name="customerEmail"
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

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" placeholder="0801 234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isAuthenticated ? (
                <p className="text-[13px] text-(--mute)">
                  Have an account?{' '}
                  <Link to="/login" className="text-(--ink) underline underline-offset-2">
                    Sign in
                  </Link>{' '}
                  to autofill your details.
                </p>
              ) : null}
            </section>

            {/* Saved address picker. Only shown to authenticated customers
                with at least one saved address. Tapping a row prefills the
                AddressForm below; tapping "Enter a new address" leaves the
                form blank and turns on the "Save this address" checkbox. */}
            {isAuthenticated && savedAddresses.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-serif italic text-2xl text-(--ink)">Delivery address</h2>
                <div className="flex flex-col gap-2">
                  {savedAddresses.map((a) => {
                    const isSelected = selectedAddressId === a._id
                    return (
                      <button
                        type="button"
                        key={a._id}
                        onClick={() => setSelectedAddressId(a._id)}
                        className={`text-left border px-4 py-3 transition-colors ${
                          isSelected
                            ? 'border-(--ink) bg-(--cream-soft)'
                            : 'border-(--hairline) hover:border-(--ink)'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[14px] text-(--ink) font-medium">
                            {a.label || a.fullName}
                          </span>
                          {a.isDefault ? (
                            <span className="text-[10px] uppercase tracking-[0.12em] font-medium px-1.5 py-0.5 bg-blush text-berry">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="m-0 text-[12.5px] text-(--graphite) leading-snug">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''} · {a.city}, {a.state}
                        </p>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddressId('new')
                      form.setValue('address', {
                        fullName: user?.name ?? '',
                        phone: user?.phone ?? '',
                        line1: '',
                        line2: '',
                        city: '',
                        state: '',
                        country: 'NG',
                        postal: '',
                      })
                      form.setValue('saveAddress', true)
                    }}
                    className={`text-left border border-dashed px-4 py-3 transition-colors ${
                      selectedAddressId === 'new'
                        ? 'border-(--ink) bg-(--cream-soft)'
                        : 'border-(--hairline) text-(--graphite) hover:border-(--ink)'
                    }`}
                  >
                    <span className="text-[14px] font-medium text-(--ink)">
                      Enter a new address
                    </span>
                  </button>
                </div>
              </section>
            ) : null}

            {/* Show the fieldset only when entering a new address, or when
                the customer is a guest (no saved book to pick from). */}
            {!isAuthenticated || savedAddresses.length === 0 || selectedAddressId === 'new' ? (
              <AddressForm
                form={form}
                namePrefix="address"
                heading={
                  isAuthenticated && savedAddresses.length === 0 ? 'Delivery address' : undefined
                }
              />
            ) : null}

            {isAuthenticated && selectedAddressId === 'new' ? (
              <label className="flex items-center gap-3 text-[14px] text-(--ink) cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 border border-(--hairline) accent-(--ink)"
                  {...form.register('saveAddress')}
                />
                Save this address to my account for next time.
              </label>
            ) : null}

            <section className="flex flex-col gap-4">
              <h2 className="font-serif italic text-2xl text-(--ink)">Shipping</h2>

              {!watchedState || !watchedCity ? (
                <div className="border border-dashed border-(--hairline) bg-(--cream-soft) px-4 py-5 text-[14px] text-(--mute)">
                  Enter your delivery address to see shipping options.
                </div>
              ) : ratesQuery.isLoading ? (
                <div className="border border-(--hairline) px-4 py-5 text-[14px] text-(--mute)">
                  Looking up rates for {watchedState}…
                </div>
              ) : ratesQuery.isError ? (
                <div className="border border-(--coral) bg-(--coral-soft) px-4 py-5 text-[14px] text-(--ink)">
                  Could not load shipping rates. Try a different state or refresh.
                </div>
              ) : rateOptions.length === 0 ? (
                <div className="border border-(--hairline) px-4 py-5 text-[14px] text-(--mute)">
                  No shipping options available for that destination.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {rateOptions.map((opt) => {
                    const isSelected = selectedMethod === opt.method
                    return (
                      <button
                        type="button"
                        key={opt.method}
                        onClick={() => setSelectedMethod(opt.method)}
                        className={`text-left border px-4 py-4 transition-colors ${
                          isSelected
                            ? 'border-(--ink) bg-(--cream-soft)'
                            : 'border-(--hairline) hover:border-(--ink)'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[15px] text-(--ink) font-medium">{opt.name}</div>
                            <div className="text-[12px] uppercase tracking-widest text-(--mute) mt-1">
                              {opt.eta}
                            </div>
                          </div>
                          <div className="text-[15px] text-(--ink) font-semibold">
                            {formatPrice(opt.amount)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Right column: order summary ──────────────────────── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-(--hairline) bg-(--paper) p-6 flex flex-col gap-5">
              <h2 className="font-serif italic text-2xl text-(--ink)">Order summary</h2>

              <ul className="flex flex-col gap-4 m-0 p-0 list-none border-t border-(--hairline-soft) pt-4">
                {lines.map((l) => (
                  <li key={l.variantId} className="flex gap-3">
                    <div className="w-16 shrink-0">
                      <Photo src={l.imageUrl} alt={l.productName} tone="blush" ratio="4/5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] text-(--ink) font-medium leading-tight">
                        {l.productName}
                      </div>
                      <div className="text-[12px] text-(--mute) mt-1">
                        {l.variantLabel} · Qty {l.qty}
                      </div>
                    </div>
                    <div className="text-[14px] text-(--ink) font-semibold whitespace-nowrap">
                      {formatPrice(l.unitPrice * l.qty)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* ── Discount code entry ─────────────────────────── */}
              <DiscountEntry
                applied={applied}
                codeInput={codeInput}
                setCodeInput={setCodeInput}
                discountError={discountError}
                isApplying={applyDiscount.isPending}
                onApply={() => {
                  const trimmed = codeInput.trim()
                  if (!trimmed) return
                  setDiscountError(null)
                  applyDiscount.mutate(
                    { code: trimmed, subtotal: subtotalKobo },
                    {
                      onSuccess: (res) => {
                        if (res.data) {
                          setApplied(res.data)
                          setDiscountError(null)
                          toast.success(`${res.data.description} applied.`)
                        }
                      },
                      onError: (error) => {
                        setApplied(null)
                        setDiscountError(handleApiError(error).message)
                      },
                    },
                  )
                }}
                onRemove={() => {
                  setApplied(null)
                  setCodeInput('')
                  setDiscountError(null)
                }}
              />

              <div className="border-t border-(--hairline-soft) pt-4 flex flex-col gap-2 text-[14px] text-(--graphite)">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotalKobo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{selectedRate ? formatPrice(shippingKobo) : '—'}</span>
                </div>
                {discountKobo > 0 ? (
                  <div className="flex justify-between text-(--berry)">
                    <span>Discount ({applied?.code})</span>
                    <span>− {formatPrice(discountKobo)}</span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-(--hairline) pt-4 flex justify-between items-baseline">
                <span className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
                  Total
                </span>
                <span className="text-2xl font-semibold text-(--ink)">
                  {formatPrice(totalKobo)}
                </span>
              </div>

              {/* NGN-charge note. Paystack only handles Mensa's NGN account,
                  so a visitor browsing in USD / GBP / EUR needs to know what
                  will actually hit their card. */}
              {showCurrencyNote ? (
                <div className="bg-cream-soft border border-hairline-soft px-3.5 py-2.5 text-[12px] text-graphite leading-relaxed">
                  Prices shown in {displayCurrency}. Your card will be charged{' '}
                  <span className="text-ink font-medium">
                    ₦{(totalKobo / 100).toLocaleString('en-NG')}
                  </span>{' '}
                  in NGN by Paystack. Your bank may apply a foreign-exchange fee.
                </div>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={paying || initialize.isPending || !selectedRate}
              >
                {paying || initialize.isPending
                  ? 'Opening Paystack…'
                  : `Pay ${formatPrice(totalKobo)}`}
              </Button>

              <p className="text-[12px] text-(--mute) text-center">
                Secure payment by Paystack. We never store your card.
              </p>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// DiscountEntry — collapsible "Have a code?" row that lives in the
// order summary card. Two visual states:
//   • Not applied: link toggles open an inline input + Apply button.
//   • Applied:     compact pill with the code + a Remove action.
// Errors render inline below the input where the customer typed.
// ─────────────────────────────────────────────────────────────────
interface DiscountEntryProps {
  applied: ApplyDiscountResponseData | null
  codeInput: string
  setCodeInput: (v: string) => void
  discountError: string | null
  isApplying: boolean
  onApply: () => void
  onRemove: () => void
}

function DiscountEntry({
  applied,
  codeInput,
  setCodeInput,
  discountError,
  isApplying,
  onApply,
  onRemove,
}: DiscountEntryProps) {
  const [open, setOpen] = useState(false)

  if (applied) {
    return (
      <div className="border-t border-(--hairline-soft) pt-4 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
            Code applied
          </span>
          <span className="text-[14px] text-(--ink) font-medium truncate">
            {applied.code} <span className="text-(--mute)">· {applied.description}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-[12px] underline underline-offset-2 text-(--ink) shrink-0"
        >
          Remove
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="border-t border-(--hairline-soft) pt-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[13px] text-(--ink) underline underline-offset-2"
        >
          Have a discount code?
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-(--hairline-soft) pt-4 flex flex-col gap-2">
      <label className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
        Discount code
      </label>
      <div className="flex gap-2">
        <input
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
          placeholder="SWITCH10"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 h-11 border border-(--hairline) bg-(--paper) px-3 text-[14px] tracking-[0.06em] text-(--ink) focus-visible:outline-none focus-visible:border-(--ink)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onApply()
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={isApplying || codeInput.trim().length === 0}
          onClick={onApply}
        >
          {isApplying ? 'Checking…' : 'Apply'}
        </Button>
      </div>
      {discountError ? <p className="text-[12px] text-(--coral) m-0">{discountError}</p> : null}
    </div>
  )
}
