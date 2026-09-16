// Shared bits for the admin invoice pages: status pill, totals maths, labels.

import { cn } from '@/lib/utils'
import { isInvoiceOverdue, type Invoice, type InvoiceStatus } from '@/lib/network/api/invoice.api'

export const STATUS_LABEL: Record<InvoiceStatus | 'overdue', string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  paid: 'Paid',
  void: 'Void',
  overdue: 'Overdue',
}

export function effectiveStatus(
  invoice: Pick<Invoice, 'status' | 'dueDate'>,
): InvoiceStatus | 'overdue' {
  return isInvoiceOverdue(invoice) ? 'overdue' : invoice.status
}

export function InvoiceStatusPill({ invoice }: { invoice: Pick<Invoice, 'status' | 'dueDate'> }) {
  const status = effectiveStatus(invoice)
  const tone =
    status === 'paid'
      ? 'bg-ok/10 text-ok'
      : status === 'overdue'
        ? 'bg-blush text-berry'
        : status === 'void'
          ? 'bg-cream text-mute line-through'
          : status === 'draft'
            ? 'bg-cream text-graphite'
            : 'bg-ink text-paper'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
        tone,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Mirrors computeInvoiceTotals on the backend so the builder's live panel
 *  matches what the server will store. All kobo. */
export function computeTotals(
  lineTotals: number[],
  discountKobo: number,
  vatPercent: number | null,
  shippingKobo: number,
) {
  const subtotal = lineTotals.reduce((s, n) => s + n, 0)
  const discount = Math.min(subtotal, Math.max(0, discountKobo))
  const taxable = subtotal - discount
  const vat = vatPercent != null && vatPercent > 0 ? Math.round((taxable * vatPercent) / 100) : 0
  const shipping = Math.max(0, shippingKobo)
  return { subtotal, discount, vat, shipping, total: taxable + vat + shipping }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/** Naira text input value to kobo, blank or junk becomes 0. */
export function nairaToKobo(value: string): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

export function koboToNairaString(kobo: number): string {
  return kobo === 0 ? '' : String(kobo / 100)
}
