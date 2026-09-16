// /invoices/:id (admin) — one invoice: lines, totals, timeline and actions.

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Send, Link2, Ban } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { confirm } from '@/components/ui/confirm'
import { useAdminInvoice, useSendInvoice, useVoidInvoice } from '@/lib/network/api/invoice.api'
import { buildAppUrl } from '@/lib/network/helpers/buildAppUrl'
import { formatNaira } from '@/lib/utils'
import { InvoiceStatusPill, formatDate } from './invoiceShared'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAdminInvoice(id)
  const send = useSendInvoice()
  const voidInvoice = useVoidInvoice()
  const invoice = query.data?.data?.invoice

  if (query.isLoading || !invoice) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        <div className="border border-hairline-soft bg-paper px-4 py-10 text-center t-body-s text-mute">
          {query.isError ? 'Invoice not found.' : 'Loading…'}
        </div>
      </section>
    )
  }

  const editable =
    invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'viewed'
  const shareable = invoice.status !== 'draft' && invoice.status !== 'void'
  const publicUrl = buildAppUrl('platform', `/invoice/${invoice.accessToken}`)

  const onSend = async () => {
    const ok = await confirm({
      title: `Send ${invoice.invoiceNumber} to ${invoice.customer.email}?`,
      description:
        'They get an email with a link to view and pay. Catalogue stock on the invoice is held until it is paid or voided.',
      confirmLabel: 'Send invoice',
    })
    if (ok) send.mutate(invoice._id)
  }

  const onVoid = async () => {
    const ok = await confirm({
      title: `Void ${invoice.invoiceNumber}?`,
      description:
        'The payment link stops working and any held stock is released. This cannot be undone.',
      confirmLabel: 'Void invoice',
      tone: 'destructive',
    })
    if (ok) voidInvoice.mutate(invoice._id)
  }

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success('Payment link copied.')
    } catch {
      toast.error('Could not copy. The link is shown below.')
    }
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <Link
        to="/invoices"
        className="inline-flex items-center gap-2 text-[13px] text-graphite hover:text-ink"
      >
        <ArrowLeft size={14} /> All invoices
      </Link>

      <div className="mt-4 mb-6 md:mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="t-eyebrow text-mute mb-3">Invoice</div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,4.5vw,44px)] leading-[1.02] tracking-tight text-ink">
              {invoice.invoiceNumber}
            </h1>
            <InvoiceStatusPill invoice={invoice} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editable ? (
            <Button asChild variant="secondary" size="md">
              <Link to={`/invoices/${invoice._id}/edit`}>
                <Pencil size={14} strokeWidth={1.8} /> Edit
              </Link>
            </Button>
          ) : null}
          {shareable ? (
            <Button type="button" variant="secondary" size="md" onClick={onCopyLink}>
              <Link2 size={14} strokeWidth={1.8} /> Copy link
            </Button>
          ) : null}
          {invoice.status === 'draft' ? (
            <Button
              type="button"
              variant="ink"
              size="md"
              onClick={onSend}
              disabled={send.isPending}
            >
              {send.isPending ? (
                <>
                  <Spinner size={14} /> Sending…
                </>
              ) : (
                <>
                  <Send size={14} strokeWidth={1.8} /> Send invoice
                </>
              )}
            </Button>
          ) : null}
          {editable ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onVoid}
              disabled={voidInvoice.isPending}
            >
              {voidInvoice.isPending ? (
                <>
                  <Spinner size={14} /> Voiding…
                </>
              ) : (
                <>
                  <Ban size={14} strokeWidth={1.8} /> Void
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 md:gap-6 items-start">
        <div className="flex flex-col gap-5 md:gap-6 min-w-0">
          {/* Lines */}
          <div className="border border-hairline-soft bg-paper overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left border-b border-hairline-soft">
                  <Th>Description</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => (
                  <tr
                    key={l._id ?? l.description}
                    className="border-b border-hairline-soft last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="text-ink">{l.description}</div>
                      {l.variantLabel ? (
                        <div className="text-[12px] text-mute">{l.variantLabel}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right text-graphite">{l.qty}</td>
                    <td className="px-4 py-3 text-right text-graphite whitespace-nowrap">
                      {formatNaira(l.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-ink whitespace-nowrap">
                      {formatNaira(l.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-4 border-t border-hairline-soft flex flex-col gap-2 text-[13px] text-graphite">
              <Row label="Subtotal" value={formatNaira(invoice.totals.subtotal)} />
              {invoice.totals.discount > 0 ? (
                <Row label="Discount" value={`− ${formatNaira(invoice.totals.discount)}`} />
              ) : null}
              {invoice.vatPercent != null && invoice.vatPercent > 0 ? (
                <Row
                  label={`VAT (${invoice.vatPercent}%)`}
                  value={formatNaira(invoice.totals.vat)}
                />
              ) : null}
              {invoice.totals.shipping > 0 ? (
                <Row label={invoice.shippingLabel} value={formatNaira(invoice.totals.shipping)} />
              ) : null}
              <div className="flex justify-between text-[15px] font-medium text-ink pt-2 border-t border-hairline-soft">
                <span>Grand total</span>
                <span>{formatNaira(invoice.totals.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes ? (
            <div className="border border-hairline-soft bg-paper p-5">
              <div className="t-eyebrow text-mute mb-2">Notes</div>
              <p className="m-0 text-[14px] text-graphite whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          ) : null}

          {shareable ? (
            <div className="border border-hairline-soft bg-paper p-5">
              <div className="t-eyebrow text-mute mb-2">Payment link</div>
              <code className="block text-[12.5px] text-ink break-all">{publicUrl}</code>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 md:gap-6">
          <div className="border border-hairline-soft bg-paper p-5">
            <div className="t-eyebrow text-mute mb-3">Billed to</div>
            <div className="text-[15px] text-ink">{invoice.customer.name}</div>
            <div className="text-[13px] text-graphite">{invoice.customer.email}</div>
            {invoice.customer.phone ? (
              <div className="text-[13px] text-graphite">{invoice.customer.phone}</div>
            ) : null}
            {invoice.customer.address ? (
              <div className="mt-1 text-[13px] text-graphite">{invoice.customer.address}</div>
            ) : null}
          </div>

          <div className="border border-hairline-soft bg-paper p-5 flex flex-col gap-2 text-[13px]">
            <div className="t-eyebrow text-mute mb-1">Timeline</div>
            <Row label="Created" value={formatDate(invoice.createdAt)} />
            <Row label="Sent" value={formatDate(invoice.sentAt)} />
            <Row label="Viewed" value={formatDate(invoice.viewedAt)} />
            <Row label="Due" value={formatDate(invoice.dueDate)} />
            <Row label="Paid" value={formatDate(invoice.paidAt)} />
            {invoice.voidedAt ? <Row label="Voided" value={formatDate(invoice.voidedAt)} /> : null}
            {invoice.orderId ? (
              <Link
                to={`/orders/${invoice.orderId}`}
                className="mt-2 text-ink underline underline-offset-2"
              >
                View the order created from this invoice
              </Link>
            ) : null}
            {invoice.stockReserved ? (
              <div className="mt-2 text-[11px] uppercase tracking-widest font-mono text-mute">
                Stock held for this invoice
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] uppercase tracking-widest font-medium text-mute font-mono ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
