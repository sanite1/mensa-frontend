// /invoice/:token — the customer's invoice. Laid out like the printed
// template: title and logo, billed to and invoice meta, an ink header line
// table, totals with an ink grand total bar, then payment information and
// the studio contact footer. Pay now arrives with the payment phase.

import { useParams } from 'react-router-dom'

import { MensaWordmark } from '@/components/chrome/MensaWordmark'
import { usePublicInvoice, isInvoiceOverdue, type Invoice } from '@/lib/network/api/invoice.api'
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
  useSeo({ title: 'Invoice', noindex: true })
  const query = usePublicInvoice(token)
  const data = query.data?.data

  if (query.isLoading) {
    return (
      <div className="bg-paper min-h-[60vh] flex items-center justify-center t-body text-mute">
        Loading your invoice…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-paper min-h-[60vh] px-5 py-16 flex flex-col items-center text-center gap-3">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,44px)] leading-[1.05] tracking-tight text-ink">
          We could not find that invoice.
        </h1>
        <p className="m-0 t-body text-graphite max-w-120">
          The link may be incomplete or the invoice may have been cancelled. Reach us at
          support@mensaproducts.com and we will sort it out.
        </p>
      </div>
    )
  }

  const { invoice, settings } = data
  const overdue = isInvoiceOverdue(invoice)

  return (
    <div className="bg-cream-soft min-h-[70vh] px-4 md:px-8 py-8 md:py-14">
      <div className="max-w-190 mx-auto">
        <StatusBanner invoice={invoice} overdue={overdue} />

        <article className="bg-paper border border-hairline-soft px-6 py-8 md:px-12 md:py-12">
          {/* Title row */}
          <header className="flex items-start justify-between gap-6">
            <h1 className="m-0 font-sans font-bold text-[clamp(34px,7vw,56px)] leading-none tracking-tight text-ink">
              INVOICE
            </h1>
            <MensaWordmark height={36} tone="ink" />
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
                <tr className="bg-ink text-paper">
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
              <div className="mt-2 bg-ink text-paper flex items-center justify-between px-5 py-3 font-bold text-[16px]">
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
          <footer className="mt-14 md:mt-20 pt-6 border-t border-ink flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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
    </div>
  )
}

function StatusBanner({ invoice, overdue }: { invoice: Invoice; overdue: boolean }) {
  if (invoice.status === 'paid') {
    return (
      <div className="mb-4 border border-ok/30 bg-ok/10 px-5 py-3 text-[14px] text-ok">
        Paid on {formatDate(invoice.paidAt)}. Thank you.
      </div>
    )
  }
  if (invoice.status === 'void') {
    return (
      <div className="mb-4 border border-hairline bg-cream px-5 py-3 text-[14px] text-graphite">
        This invoice was cancelled and no payment is due.
      </div>
    )
  }
  if (overdue) {
    return (
      <div className="mb-4 border border-coral bg-blush px-5 py-3 text-[14px] text-berry">
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
