// currency.store.ts — selected display currency.

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
