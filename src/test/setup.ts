// ═══════════════════════════════════════════════════════════════
// Vitest global setup — runs before every test file.
//
// Pulls in @testing-library/jest-dom so we get the friendly DOM
// matchers (toBeInTheDocument, toHaveTextContent, etc.) and resets
// localStorage between tests so persisted stores (cart, currency,
// referral) don't bleed across files.
// ═══════════════════════════════════════════════════════════════

import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

afterEach(() => {
  // Currency picker, cart, and referral attribution all persist to
  // localStorage. Reset between tests so state can't leak.
  localStorage.clear()
})
