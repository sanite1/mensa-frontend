// ═══════════════════════════════════════════════════════════════
// currency.store.ts — selected display currency.
//
// Persisted to localStorage so a visitor's choice survives reloads.
// Defaults to NGN since the brand is NGN-first.
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyCode } from '@/lib/currency'

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (next: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'NGN',
      setCurrency: (next) => set({ currency: next }),
    }),
    { name: 'mensa-currency' },
  ),
)
