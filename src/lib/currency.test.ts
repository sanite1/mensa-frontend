import { describe, it, expect } from 'vitest'
import {
  RATES,
  convertKoboTo,
  formatPriceFromKobo,
  CURRENCIES,
} from './currency'

describe('currency conversion', () => {
  describe('convertKoboTo', () => {
    it('returns naira amount unchanged for NGN', () => {
      // 25,000 NGN = 2,500,000 kobo
      expect(convertKoboTo(2_500_000, 'NGN')).toBe(25_000)
    })

    it('converts kobo to USD using the rate', () => {
      // 1,600,000 kobo = 16,000 NGN. At 1600 NGN per USD that's exactly $10.
      expect(convertKoboTo(1_600_000, 'USD')).toBe(10)
    })

    it('converts kobo to GBP using the rate', () => {
      // 2,000,000 kobo = 20,000 NGN. At 2000 NGN per GBP that's £10.
      expect(convertKoboTo(2_000_000, 'GBP')).toBe(10)
    })

    it('handles zero', () => {
      expect(convertKoboTo(0, 'USD')).toBe(0)
    })
  })

  describe('formatPriceFromKobo', () => {
    it('renders NGN with no decimals and thousand separators', () => {
      expect(formatPriceFromKobo(2_500_000, 'NGN')).toBe('₦25,000')
    })

    it('renders USD with two decimals and dollar sign', () => {
      // 25,000 NGN at 1600 NGN/USD = $15.625 → $15.63 rounded to 2dp
      expect(formatPriceFromKobo(2_500_000, 'USD')).toBe('$15.63')
    })

    it('renders GBP with £ symbol', () => {
      // 25,000 NGN at 2000 NGN/GBP = £12.50 exactly
      expect(formatPriceFromKobo(2_500_000, 'GBP')).toBe('£12.50')
    })

    it('renders EUR with € symbol', () => {
      // 17,000 NGN at 1700 NGN/EUR = €10.00
      expect(formatPriceFromKobo(1_700_000, 'EUR')).toBe('€10.00')
    })

    it('handles zero in every currency', () => {
      expect(formatPriceFromKobo(0, 'NGN')).toBe('₦0')
      expect(formatPriceFromKobo(0, 'USD')).toBe('$0.00')
    })
  })

  describe('rate consistency', () => {
    it('NGN rate is 1 — the base currency', () => {
      expect(RATES.NGN).toBe(1)
    })

    it('every supported currency has a positive rate', () => {
      for (const code of Object.keys(CURRENCIES)) {
        expect(RATES[code as keyof typeof RATES]).toBeGreaterThan(0)
      }
    })
  })
})
