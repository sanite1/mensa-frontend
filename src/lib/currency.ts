// ═══════════════════════════════════════════════════════════════
// currency.ts — display-only currency model.
//
// Every price in the system is canonical in **NGN kobo** (integers,
// 100 kobo = 1 naira). The customer can choose to view prices in
// NGN, USD, GBP or EUR; the conversion is purely a display layer
// and Paystack still charges in NGN at checkout.
//
// Exchange rates are static for launch. Swap `RATES` for a live
// FX feed (e.g. openexchangerates.org / a backend cron) without
// changing call sites.
// ═══════════════════════════════════════════════════════════════

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR'

export interface CurrencyMeta {
  code: CurrencyCode
  name: string
  symbol: string
  /** Flag emoji or short tag, used in the picker chip. */
  flag: string
  /** How many of the smallest unit in 1 of the main unit (kobo for NGN,
   *  cents for USD, etc.). Always 100 for the currencies we support. */
  minorUnits: number
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', minorUnits: 100 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', minorUnits: 100 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', minorUnits: 100 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', minorUnits: 100 },
}

/** Exchange rate as NAIRA per 1 unit of the target currency.
 *  i.e. `1 USD = RATES.USD naira`. To convert kobo into a target
 *  currency: (kobo / 100) / RATES[target]. */
export const RATES: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1600,
  GBP: 2000,
  EUR: 1700,
}

/** Convert kobo into the target currency's MAIN unit (naira, dollar, etc.).
 *  Returned as a plain number for downstream formatting. */
export function convertKoboTo(kobo: number, target: CurrencyCode): number {
  const naira = kobo / 100
  return naira / RATES[target]
}

/** Format a kobo amount as a human-readable price string in the target
 *  currency. NGN renders without decimals (₦25,000); others render with
 *  two (e.g. $15.63) — that's what locals expect from each. */
export function formatPriceFromKobo(kobo: number, currency: CurrencyCode): string {
  const meta = CURRENCIES[currency]
  const amount = convertKoboTo(kobo, currency)

  if (currency === 'NGN') {
    // Match the existing formatNaira convention for backward parity.
    return `${meta.symbol}${Math.round(amount).toLocaleString('en-NG')}`
  }

  // Other currencies: 2 decimals, locale-grouped thousands.
  return `${meta.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// ─── React hook ─────────────────────────────────────────────────

import { useCurrencyStore } from '@/lib/network/stores/currency.store'

/** Returns a `format(kobo)` function bound to the visitor's currently
 *  selected display currency. Components that use this re-render
 *  automatically when the visitor switches currencies via the picker. */
export function useFormatPrice(): (kobo: number) => string {
  const currency = useCurrencyStore((s) => s.currency)
  return (kobo: number) => formatPriceFromKobo(kobo, currency)
}
