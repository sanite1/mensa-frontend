// ─────────────────────────────────────────────────────────────────────────
// Feature flags.
//
// All driven by Vite env vars so they can be flipped per environment
// without code changes. To turn one on locally:
//
//   echo 'VITE_FEATURE_FREE_DELIVERY=true' >> .env
//   # restart the dev server
//
// Defaults are off so a fresh checkout never accidentally surfaces a
// promo we aren't honoring yet.
// ─────────────────────────────────────────────────────────────────────────

const flag = (key: string): boolean => import.meta.env[key] === 'true'

export const features = {
  /** Show the "Free delivery in Abuja & Lagos over ₦20,000" messaging
   *  across the header banner, shop trust strip, PDP trust block, and
   *  the cart drawer progress bar. */
  freeDelivery: flag('VITE_FEATURE_FREE_DELIVERY'),
}

/** Threshold above which free delivery applies, in kobo.
 *  Only consulted when `features.freeDelivery` is true. */
export const FREE_DELIVERY_THRESHOLD_KOBO = 20_000 * 100

/** Formatted display version of the threshold (₦20,000). */
export const FREE_DELIVERY_THRESHOLD_LABEL = '₦20,000'
