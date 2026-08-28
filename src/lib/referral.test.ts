import { describe, it, expect, beforeEach } from 'vitest'
import { captureReferralFromUrl, clearReferralCode, getReferralCode } from './referral'

/** Replace the current URL without a real navigation. jsdom honours this. */
function setUrl(href: string): void {
  window.history.replaceState({}, '', href)
}

beforeEach(() => {
  setUrl('https://mensaproducts.com/')
  // setup.ts clears localStorage between tests, but we re-clear here so
  // these tests can also run in isolation.
  localStorage.clear()
})

describe('captureReferralFromUrl', () => {
  it('returns null when there is no ref param', () => {
    setUrl('https://mensaproducts.com/shop')
    expect(captureReferralFromUrl()).toBeNull()
    expect(getReferralCode()).toBeNull()
  })

  it('persists a valid code upper-cased', () => {
    setUrl('https://mensaproducts.com/?ref=ada123')
    expect(captureReferralFromUrl()).toBe('ADA123')
    expect(getReferralCode()).toBe('ADA123')
  })

  it('rejects codes that fail the format check', () => {
    setUrl('https://mensaproducts.com/?ref=ad') // too short
    expect(captureReferralFromUrl()).toBeNull()
    expect(getReferralCode()).toBeNull()
  })

  it('overwrites an earlier code with a fresh click — most-recent-click wins', () => {
    setUrl('https://mensaproducts.com/?ref=OLD12')
    captureReferralFromUrl()
    expect(getReferralCode()).toBe('OLD12')

    setUrl('https://mensaproducts.com/?ref=NEW34')
    captureReferralFromUrl()
    expect(getReferralCode()).toBe('NEW34')
  })
})

describe('getReferralCode TTL', () => {
  it('expires entries past their expiresAt timestamp', () => {
    // Manually plant an expired entry rather than time-travel — the
    // expiry check is a simple Date.now() comparison.
    localStorage.setItem(
      'mensa-ref',
      JSON.stringify({ code: 'STALE1', expiresAt: Date.now() - 1000 }),
    )
    expect(getReferralCode()).toBeNull()
    // Expired entries are evicted on read.
    expect(localStorage.getItem('mensa-ref')).toBeNull()
  })

  it('returns null and ignores corrupt entries gracefully', () => {
    localStorage.setItem('mensa-ref', '{not valid json')
    expect(getReferralCode()).toBeNull()
  })
})

describe('clearReferralCode', () => {
  it('removes the stored code', () => {
    setUrl('https://mensaproducts.com/?ref=ABC123')
    captureReferralFromUrl()
    expect(getReferralCode()).toBe('ABC123')

    clearReferralCode()
    expect(getReferralCode()).toBeNull()
  })
})
