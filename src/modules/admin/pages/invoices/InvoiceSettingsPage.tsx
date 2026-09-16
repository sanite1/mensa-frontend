// /invoices/settings (admin) — bank and contact details printed on every invoice.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  useInvoiceSettings,
  useUpdateInvoiceSettings,
  type InvoiceSettings,
} from '@/lib/network/api/invoice.api'

const inputClass =
  'h-11 w-full border border-hairline bg-paper px-3.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink'

const EMPTY: InvoiceSettings = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  contactPhone: '',
  contactAddress: '',
  contactWebsite: '',
  defaultVatPercent: null,
}

export function InvoiceSettingsPage() {
  const query = useInvoiceSettings()
  const save = useUpdateInvoiceSettings()
  const [draft, setDraft] = useState<InvoiceSettings | null>(null)

  useEffect(() => {
    if (query.data?.data && draft === null) {
      setDraft({ ...EMPTY, ...query.data.data })
    }
  }, [query.data, draft])

  const patch = (p: Partial<InvoiceSettings>) => setDraft((d) => (d ? { ...d, ...p } : d))

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
          <div className="t-eyebrow text-mute mb-3">Invoices</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Bank details
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Printed in the payment information block of every invoice and PDF.
          </p>
        </div>
        <Button
          type="button"
          variant="ink"
          size="md"
          onClick={() => draft && save.mutate(draft)}
          disabled={!draft || save.isPending}
        >
          {save.isPending ? (
            <>
              <Spinner size={14} /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>

      {!draft ? (
        <div className="border border-hairline-soft bg-paper px-4 py-10 text-center t-body-s text-mute">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          <div className="border border-hairline-soft bg-paper p-5 md:p-6 flex flex-col gap-4">
            <div className="t-eyebrow text-mute">Payment information</div>
            <Field label="Bank">
              <input
                type="text"
                value={draft.bankName}
                onChange={(e) => patch({ bankName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Account name">
              <input
                type="text"
                value={draft.accountName}
                onChange={(e) => patch({ accountName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Account number">
              <input
                type="text"
                inputMode="numeric"
                value={draft.accountNumber}
                onChange={(e) => patch({ accountNumber: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Default VAT percent (blank for none)">
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={draft.defaultVatPercent ?? ''}
                onChange={(e) =>
                  patch({
                    defaultVatPercent: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="border border-hairline-soft bg-paper p-5 md:p-6 flex flex-col gap-4">
            <div className="t-eyebrow text-mute">Footer contact</div>
            <Field label="Phone">
              <input
                type="tel"
                value={draft.contactPhone}
                onChange={(e) => patch({ contactPhone: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Address">
              <input
                type="text"
                value={draft.contactAddress}
                onChange={(e) => patch({ contactAddress: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Website">
              <input
                type="text"
                value={draft.contactWebsite}
                onChange={(e) => patch({ contactWebsite: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
        {label}
      </div>
      {children}
    </div>
  )
}
