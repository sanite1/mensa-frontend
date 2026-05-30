// ═══════════════════════════════════════════════════════════════
// paystack.ts — lazy-load the Paystack v2 inline SDK and expose a
// promise-shaped "resume transaction" helper.
//
// The backend's /checkout/initialize call already creates the
// transaction and returns an accessCode + reference. On the
// frontend we just open Paystack's inline modal pointed at that
// access code and resolve / reject based on the callback.
// ═══════════════════════════════════════════════════════════════

const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopInstance
  }
}

interface PaystackPopInstance {
  newTransaction(opts: PaystackNewTransactionOpts): void
  resumeTransaction(accessCode: string): void
}

interface PaystackNewTransactionOpts {
  key: string
  email: string
  amount: number
  reference: string
  onSuccess?: (transaction: { reference: string; status: string }) => void
  onCancel?: () => void
  onError?: (error: unknown) => void
  metadata?: Record<string, unknown>
}

let scriptPromise: Promise<void> | null = null

/** Load Paystack inline SDK once and cache the promise. */
function loadPaystackScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paystack can only run in the browser.'))
  }
  if (window.PaystackPop) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Paystack script failed to load.')),
      )
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Paystack script failed to load.'))
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

export type PaystackOutcome =
  | { status: 'success'; reference: string }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }

/**
 * Open the Paystack inline modal for a backend-initialized transaction
 * (we already have an access code + reference). Resolves once the modal
 * closes with the customer's outcome — never rejects so the caller can
 * branch cleanly on `status`.
 */
export async function openPaystackInline(input: {
  publicKey: string
  email: string
  amountKobo: number
  reference: string
  metadata?: Record<string, unknown>
}): Promise<PaystackOutcome> {
  try {
    await loadPaystackScript()
  } catch (error) {
    return { status: 'error', message: (error as Error).message }
  }

  if (!window.PaystackPop) {
    return { status: 'error', message: 'Paystack is not available right now.' }
  }

  return new Promise<PaystackOutcome>((resolve) => {
    const popup = new window.PaystackPop!()
    popup.newTransaction({
      key: input.publicKey,
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      metadata: input.metadata,
      onSuccess: (tx) => resolve({ status: 'success', reference: tx.reference }),
      onCancel: () => resolve({ status: 'cancelled' }),
      onError: (err) =>
        resolve({
          status: 'error',
          message:
            err instanceof Error
              ? err.message
              : typeof err === 'string'
                ? err
                : 'Payment failed. Please try again.',
        }),
    })
  })
}
