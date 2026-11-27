// /invoice/:token — the customer's invoice. Laid out like the printed
// template: title and logo, billed to and invoice meta, a pink header line
// table, totals with a pink grand total bar, then payment information and
// the studio contact footer. Pay now runs the same Paystack inline flow as
// checkout, then verifies on return so the page never waits on the webhook.

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { MensaWordmark } from '@/components/chrome/MensaWordmark'
import {
  usePayInvoice,
  usePublicInvoice,
  useVerifyInvoice,
  isInvoiceOverdue,
  type Invoice,
} from '@/lib/network/api/invoice.api'
import { openPaystackInline } from '@/lib/paystack'
import { downloadInvoicePdf } from '@/lib/invoicePdf'
import { handleApiError } from '@/lib/network/helpers/handleApiError'
import { useSeo } from '@/lib/seo'
import { formatNaira, cn } from '@/lib/utils'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function InvoicePage() {
  const { token } = useParams<{ token: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  useSeo({ title: 'Invoice', noindex: true })
  const query = usePublicInvoice(token)
  const data = query.data?.data

  const pay = usePayInvoice()
  const verify = useVerifyInvoice()
  const [paying, setPaying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const onDownloadPdf = async () => {
    if (!data) return
    setDownloading(true)
    try {
      await downloadInvoicePdf(data.invoice, data.settings)
    } catch {
      toast.error('Could not build the PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Verify on load, once: after a hosted Paystack redirect (reference in the
  // URL) or whenever an attempt was started but the invoice is still unpaid,
  // so a customer who closed the modal after paying still sees Paid.
  const verifiedRef = useRef(false)
  useEffect(() => {
    if (!token || !data || verifiedRef.current) return
    const inv = data.invoice
    const returnedFromPaystack = searchParams.has('reference') || searchParams.has('trxref')
    const attempted = (inv.payment?.attempts ?? 0) > 0
    const awaiting = inv.status === 'sent' || inv.status === 'viewed'
    if (!awaiting || (!returnedFromPaystack && !attempted)) return
    verifiedRef.current = true
    verify.mutate(token, {
      onSettled: () => {
        query.refetch()
        if (returnedFromPaystack) setSearchParams({}, { replace: true })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, data])

  const onPay = async () => {
    if (!token) return
    setPaying(true)
    try {
      const init = await pay.mutateAsync(token)
      const p = init.data
      if (!p) throw new Error('Could not start the payment.')
      const outcome = await openPaystackInline({
        publicKey: p.publicKey,
        email: p.email,
        amountKobo: p.amount,
        reference: p.reference,
        metadata: { kind: 'invoice' },
      })
      if (outcome.status === 'success') {
        await verify.mutateAsync(token)
        await query.refetch()
        toast.success('Payment received. Thank you.')
      } else if (outcome.status === 'cancelled') {
        toast.message('Payment cancelled. You can pay whenever you are ready.')
      } else {
        toast.error(outcome.message)
      }
    } catch (err) {
      toast.error(handleApiError(err).message)
    } finally {
      setPaying(false)
    }
  }

  if (query.isLoading) {
    return (
      <main className="section section--blush min-h-[60vh]">
        <p className="wrap text-center text-(--mute)">Loading your invoice…</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="section section--blush min-h-[60vh]">
        <div className="wrap grid justify-items-center gap-4 text-center">
          <h1 className="split text-(length:--fs-h2)">
            <span className="split-line">
              <span>We could not find that invoice.</span>
            </span>
          </h1>
          <p className="lede max-w-120">
            The link may be incomplete or the invoice may have been cancelled. Reach us at
            support@mensaproducts.com and we will sort it out.
          </p>
        </div>
      </main>
    )
  }

  const { invoice, settings } = data
  const overdue = isInvoiceOverdue(invoice)
  const payable = invoice.status === 'sent' || invoice.status === 'viewed'
  const checking = verify.isPending && !paying

  return (
    <main className="section section--blush min-h-[70vh]">
      <div className="wrap max-w-190">
        <StatusBanner invoice={invoice} overdue={overdue} />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onDownloadPdf}
            disabled={downloading}
          >
            {downloading ? 'Building PDF…' : 'Download PDF'}
          </button>
        </div>

        {payable ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-(--r-md) bg-(--white) px-6 py-5 shadow-(--shadow)">
            <div>
              <span className="eyebrow">Amount due</span>
              <div className="mt-2 text-(length:--fs-h3) font-medium leading-none tracking-tight text-(--ink)">
                {formatNaira(invoice.totals.total)}
              </div>
            </div>
            <button type="button" className="btn" onClick={onPay} disabled={paying || checking}>
              {paying ? 'Opening Paystack…' : checking ? 'Checking payment…' : 'Pay now'}
            </button>
          </div>
        ) : null}

        <article className="rounded-(--r-md) bg-(--white) px-6 py-8 shadow-(--shadow) md:px-12 md:py-12">
          {/* Title row */}
          <header className="flex items-start justify-between gap-6">
            <h1 className="m-0 font-sans font-bold text-[clamp(34px,7vw,56px)] leading-none tracking-tight text-ink">
              INVOICE
            </h1>
            <MensaWordmark height={36} tone="pink" />
          </header>

          {/* Billed to and meta */}
          <div className="mt-10 md:mt-14 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="text-[13px] font-bold tracking-[0.06em] uppercase text-ink">
                Billed to:
              </div>
              <div className="mt-1.5 text-[15px] leading-[1.6] text-ink">
                <div>{invoice.customer.name}</div>
                {invoice.customer.address ? <div>{invoice.customer.address}</div> : null}
                {invoice.customer.phone ? <div>{invoice.customer.phone}</div> : null}
                <div className="text-graphite">{invoice.customer.email}</div>
              </div>
            </div>
            <div className="sm:text-right text-[15px] leading-[1.6] text-ink">
              <div className="text-[13px] font-bold tracking-[0.06em] uppercase">Date :</div>
              <div>{formatDate(invoice.sentAt ?? invoice.createdAt)}</div>
              <div className="mt-3 text-[13px] font-bold tracking-[0.06em] uppercase">
                Invoice no.
              </div>
              <div>{invoice.invoiceNumber}</div>
              {invoice.dueDate ? (
                <>
                  <div className="mt-3 text-[13px] font-bold tracking-[0.06em] uppercase">
                    Due :
                  </div>
                  <div className={cn(overdue ? 'text-berry' : undefined)}>
                    {formatDate(invoice.dueDate)}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Lines */}
          <div className="mt-10 md:mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="bg-pink text-paper">
                  <th className="text-left font-semibold tracking-[0.08em] uppercase text-[13px] px-5 py-3.5">
                    Description
                  </th>
                  <th className="text-center font-semibold tracking-[0.08em] uppercase text-[13px] px-4 py-3.5">
                    Quantity
                  </th>
                  <th className="text-right font-semibold tracking-[0.08em] uppercase text-[13px] px-4 py-3.5">
                    Price
                  </th>
                  <th className="text-right font-semibold tracking-[0.08em] uppercase text-[13px] px-5 py-3.5">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, i) => (
                  <tr key={line._id ?? i} className={i % 2 === 0 ? 'bg-cream-soft' : 'bg-paper'}>
                    <td className="px-5 py-4 text-ink">
                      {line.description}
                      {line.variantLabel ? (
                        <span className="text-graphite"> · {line.variantLabel}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-center text-ink">{line.qty}</td>
                    <td className="px-4 py-4 text-right text-ink whitespace-nowrap">
                      {formatNaira(line.unitPrice)}
                    </td>
                    <td className="px-5 py-4 text-right text-ink whitespace-nowrap">
                      {formatNaira(line.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-95 text-[15px]">
              <TotalRow label="Subtotal:" value={formatNaira(invoice.totals.subtotal)} />
              {invoice.totals.discount > 0 ? (
                <TotalRow label="Discount:" value={`− ${formatNaira(invoice.totals.discount)}`} />
              ) : null}
              {invoice.vatPercent != null && invoice.vatPercent > 0 ? (
                <TotalRow
                  label={`VAT (${invoice.vatPercent}%):`}
                  value={formatNaira(invoice.totals.vat)}
                />
              ) : null}
              {invoice.totals.shipping > 0 ? (
                <TotalRow
                  label={`${invoice.shippingLabel}:`}
                  value={formatNaira(invoice.totals.shipping)}
                />
              ) : null}
              <div className="mt-2 bg-pink text-paper flex items-center justify-between px-5 py-3 font-bold text-[16px]">
                <span>Grand Total:</span>
                <span>{formatNaira(invoice.totals.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes ? (
            <p className="mt-8 m-0 text-[14px] leading-[1.6] text-graphite whitespace-pre-wrap">
              {invoice.notes}
            </p>
          ) : null}

          {/* Payment information and contact footer */}
          <footer className="mt-14 md:mt-20 pt-6 border-t border-pink flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="text-[13px] font-bold tracking-[0.06em] uppercase text-ink">
                Payment information
              </div>
              {settings.bankName || settings.accountName || settings.accountNumber ? (
                <ul className="mt-2 m-0 pl-5 text-[15px] leading-[1.7] text-ink">
                  {settings.bankName ? <li>{settings.bankName}</li> : null}
                  {settings.accountName ? <li>Account Name: {settings.accountName}</li> : null}
                  {settings.accountNumber ? <li>Account No: {settings.accountNumber}</li> : null}
                </ul>
              ) : (
                <p className="mt-2 m-0 text-[14px] text-graphite">
                  Reply to the invoice email for payment details.
                </p>
              )}
            </div>
            <div className="sm:text-right text-[15px] leading-[1.7] text-ink">
              {settings.contactPhone ? <div>{settings.contactPhone}</div> : null}
              {settings.contactAddress ? <div>{settings.contactAddress}</div> : null}
              {settings.contactWebsite ? <div>{settings.contactWebsite}</div> : null}
            </div>
          </footer>
        </article>
      </div>
    </main>
  )
}

function StatusBanner({ invoice, overdue }: { invoice: Invoice; overdue: boolean }) {
  if (invoice.status === 'paid') {
    return (
      <div className="mb-4 rounded-(--r-sm) bg-ok/10 px-5 py-3 text-(length:--fs-sm) font-medium text-ok">
        Paid on {formatDate(invoice.paidAt)}. Thank you.
      </div>
    )
  }
  if (invoice.status === 'void') {
    return (
      <div className="mb-4 rounded-(--r-sm) bg-(--white) px-5 py-3 text-(length:--fs-sm) text-(--mute)">
        This invoice was cancelled and no payment is due.
      </div>
    )
  }
  if (overdue) {
    return (
      <div className="mb-4 rounded-(--r-sm) bg-(--white) px-5 py-3 text-(length:--fs-sm) font-medium text-(--berry)">
        This invoice was due on {formatDate(invoice.dueDate)}.
      </div>
    )
  }
  return null
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-1.5 text-ink">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
