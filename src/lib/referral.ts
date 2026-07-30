// referral.ts — partner referral attribution. Persists ?ref=CODE for 30 days, checkout forwards it to /checkout/initialize.
// Kept dependency free (no React, no Zustand) so any layer can call it.

const STORAGE_KEY = 'mensa-ref'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface StoredRef {
  code: string
  expiresAt: number
}

function safeReadStorage(): StoredRef | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'code' in parsed &&
      'expiresAt' in parsed &&
      typeof (parsed as StoredRef).code === 'string' &&
      typeof (parsed as StoredRef).expiresAt === 'number'
    ) {
      return parsed as StoredRef
    }
    return null
  } catch {
    return null
  }
}

function safeWriteStorage(value: StoredRef): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Private-browsing / quota — silently ignore, attribution best-effort.
  }
}

function safeClearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Read `?ref=CODE` from the URL and persist it. A fresh code overwrites an earlier one, most recent click wins. Returns the stored code, or null. */
export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('ref')
  if (!raw) return null
  const code = raw.trim().toUpperCase()
  if (!/^[A-Z0-9]{3,16}$/.test(code)) return null
  safeWriteStorage({ code, expiresAt: Date.now() + TTL_MS })
  return code
}

/** Return the active referral code (if any, and not expired). */
export function getReferralCode(): string | null {
  const stored = safeReadStorage()
  if (!stored) return null
  if (stored.expiresAt < Date.now()) {
    safeClearStorage()
    return null
  }
  return stored.code
}

/** Wipe the stored referral. Call after a successful checkout so a
 *  later, unrelated purchase doesn't keep crediting the same partner.
 *  (Re-clicking the link will set it again.) */
export function clearReferralCode(): void {
  safeClearStorage()
}
