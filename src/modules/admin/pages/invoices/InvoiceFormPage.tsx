// /invoices/new and /invoices/:id/edit (admin) — the invoice builder.
// Customer block (pick a customer, an organisation, or type fresh), catalogue
// lines with live stock, custom lines, VAT, shipping, discount, due date and
// a live totals panel. Save draft keeps it private, Send emails the link and
// holds stock.

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Search, Send, Save, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { confirm } from '@/components/ui/confirm'
import { useAdminCustomers, type AdminCustomerListItem } from '@/lib/network/api/admin.api'
import { useAdminPartnerships } from '@/lib/network/api/b2b.api'
import type { B2BOrg } from '@/lib/network/types/b2b.types'
import {
  useAdminInvoice,
  useCreateInvoice,
  useInvoiceProducts,
  useInvoiceSettings,
  useSendInvoice,
  useUpdateInvoice,
  type Invoice,
  type InvoiceLineInput,
  type InvoiceProductPick,
  type UpsertInvoiceInput,
} from '@/lib/network/api/invoice.api'
import { formatNaira, cn } from '@/lib/utils'
import { computeTotals, koboToNairaString, nairaToKobo } from './invoiceShared'

// ─── Local state shapes ──────────────────────────────────────────

interface DraftLine {
  key: string
  kind: 'catalogue' | 'custom'
  productId?: string
  variantId?: string
  description: string
  variantLabel?: string
  /** Live stock for catalogue lines, refreshed from the picker. */
  stockCount?: number
  unitPriceNaira: string
  qty: number
}

interface DraftCustomer {
  name: string
  email: string
  phone: string
  address: string
  userId: string | null
  b2bOrgId: string | null
}

const EMPTY_CUSTOMER: DraftCustomer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  userId: null,
  b2bOrgId: null,
}

let lineSeq = 0
const nextKey = () => `l${Date.now()}-${lineSeq++}`

function lineFromInvoice(line: Invoice['lines'][number]): DraftLine {
  return {
    key: nextKey(),
    kind: line.kind,
    productId: line.productId ?? undefined,
    variantId: line.variantId ?? undefined,
    description: line.description,
    variantLabel: line.variantLabel,
    unitPriceNaira: String(line.unitPrice / 100),
    qty: line.qty,
  }
}

const inputClass =
  'h-11 w-full border border-hairline bg-paper px-3.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink'

// ─── Page ────────────────────────────────────────────────────────

export function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const existing = useAdminInvoice(id)
  const settings = useInvoiceSettings()
  const create = useCreateInvoice()
  const update = useUpdateInvoice()
  const send = useSendInvoice()

  const [customer, setCustomer] = useState<DraftCustomer>(EMPTY_CUSTOMER)
  const [lines, setLines] = useState<DraftLine[]>([])
  const [discountNaira, setDiscountNaira] = useState('')
  const [vatEnabled, setVatEnabled] = useState(false)
  const [vatPercent, setVatPercent] = useState('7.5')
  const [shippingEnabled, setShippingEnabled] = useState(false)
  const [shippingNaira, setShippingNaira] = useState('')
  const [shippingLabel, setShippingLabel] = useState('Delivery')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from the existing invoice once, or seed defaults for a new one.
  useEffect(() => {
    if (hydrated) return
    if (isEdit) {
      const inv = existing.data?.data?.invoice
      if (!inv) return
      if (inv.status === 'paid' || inv.status === 'void') {
        toast.error(`A ${inv.status} invoice cannot be edited.`)
        navigate(`/invoices/${inv._id}`, { replace: true })
        return
      }
      setCustomer({
        name: inv.customer.name,
        email: inv.customer.email,
        phone: inv.customer.phone ?? '',
        address: inv.customer.address ?? '',
        userId: inv.customer.userId ?? null,
        b2bOrgId: inv.customer.b2bOrgId ?? null,
      })
      setLines(inv.lines.map(lineFromInvoice))
      setDiscountNaira(koboToNairaString(inv.discountKobo))
      setVatEnabled(inv.vatPercent != null && inv.vatPercent > 0)
      setVatPercent(inv.vatPercent != null ? String(inv.vatPercent) : '7.5')
      setShippingEnabled(inv.shippingKobo > 0)
      setShippingNaira(koboToNairaString(inv.shippingKobo))
      setShippingLabel(inv.shippingLabel || 'Delivery')
      setNotes(inv.notes ?? '')
      setDueDate(inv.dueDate ? inv.dueDate.slice(0, 10) : '')
      setHydrated(true)
      return
    }
    const s = settings.data?.data
    if (!settings.isLoading) {
      if (s?.defaultVatPercent != null && s.defaultVatPercent > 0) {
        setVatEnabled(true)
        setVatPercent(String(s.defaultVatPercent))
      }
      setHydrated(true)
    }
  }, [hydrated, isEdit, existing.data, settings.data, settings.isLoading, navigate])

  // Live totals, same maths as the server.
  const totals = useMemo(
    () =>
      computeTotals(
        lines.map((l) => nairaToKobo(l.unitPriceNaira) * l.qty),
        nairaToKobo(discountNaira),
        vatEnabled ? Number(vatPercent) || 0 : null,
        shippingEnabled ? nairaToKobo(shippingNaira) : 0,
      ),
    [lines, discountNaira, vatEnabled, vatPercent, shippingEnabled, shippingNaira],
  )

  const stockProblems = lines.filter(
    (l) => l.kind === 'catalogue' && l.stockCount != null && l.qty > l.stockCount,
  )

  const patchLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const removeLine = (key: string) => setLines((ls) => ls.filter((l) => l.key !== key))

  const addCatalogueLine = (
    product: InvoiceProductPick,
    variant: InvoiceProductPick['variants'][number],
  ) => {
    setLines((ls) => {
      const existingLine = ls.find(
        (l) => l.kind === 'catalogue' && l.variantId === variant.variantId,
      )
      if (existingLine) {
        return ls.map((l) =>
          l.key === existingLine.key ? { ...l, qty: l.qty + 1, stockCount: variant.stockCount } : l,
        )
      }
      return [
        ...ls,
        {
          key: nextKey(),
          kind: 'catalogue',
          productId: product.productId,
          variantId: variant.variantId,
          description: product.name,
          variantLabel: variant.label !== product.name ? variant.label : undefined,
          stockCount: variant.stockCount,
          unitPriceNaira: String(variant.unitPrice / 100),
          qty: 1,
        },
      ]
    })
  }

  const addCustomLine = () =>
    setLines((ls) => [
      ...ls,
      { key: nextKey(), kind: 'custom', description: '', unitPriceNaira: '', qty: 1 },
    ])

  const buildPayload = (): UpsertInvoiceInput | null => {
    if (customer.name.trim().length < 2) {
      toast.error('Enter the customer name.')
      return null
    }
    if (!customer.email.trim()) {
      toast.error('Enter the customer email.')
      return null
    }
    if (lines.length === 0) {
      toast.error('Add at least one line to the invoice.')
      return null
    }
    for (const l of lines) {
      if (l.kind === 'custom' && l.description.trim().length < 2) {
        toast.error('Every custom line needs a description.')
        return null
      }
      if (l.kind === 'custom' && l.unitPriceNaira.trim() === '') {
        toast.error(`"${l.description || 'Custom line'}" needs a price.`)
        return null
      }
    }
    if (totals.total <= 0) {
      toast.error('The invoice total must be more than zero.')
      return null
    }
    const payloadLines: InvoiceLineInput[] = lines.map((l) =>
      l.kind === 'catalogue'
        ? {
            kind: 'catalogue',
            productId: l.productId,
            variantId: l.variantId,
            description: l.description.trim(),
            unitPrice: nairaToKobo(l.unitPriceNaira),
            qty: l.qty,
          }
        : {
            kind: 'custom',
            description: l.description.trim(),
            unitPrice: nairaToKobo(l.unitPriceNaira),
            qty: l.qty,
          },
    )
    return {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        userId: customer.userId ?? undefined,
        b2bOrgId: customer.b2bOrgId ?? undefined,
      },
      lines: payloadLines,
      discountKobo: nairaToKobo(discountNaira),
      vatPercent: vatEnabled ? Number(vatPercent) || 0 : null,
      shippingKobo: shippingEnabled ? nairaToKobo(shippingNaira) : 0,
      shippingLabel: shippingLabel.trim() || 'Delivery',
      notes: notes.trim(),
      dueDate: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : null,
    }
  }

  const persist = async (): Promise<Invoice | null> => {
    const body = buildPayload()
    if (!body) return null
    const res = isEdit
      ? await update.mutateAsync({ id: id as string, body })
      : await create.mutateAsync(body)
    return res.data?.invoice ?? null
  }

  const onSaveDraft = async () => {
    try {
      const inv = await persist()
      if (inv) navigate(`/invoices/${inv._id}`)
    } catch {
      // toastApiError already reported it.
    }
  }

  const onSend = async () => {
    if (stockProblems.length > 0) {
      toast.error('Fix the lines that exceed available stock before sending.')
      return
    }
    const ok = await confirm({
      title: `Send this invoice to ${customer.email.trim() || 'the customer'}?`,
      description:
        'They get an email with a link to view and pay. Catalogue stock on the invoice is held until it is paid or voided.',
      confirmLabel: 'Send invoice',
    })
    if (!ok) return
    try {
      const inv = await persist()
      if (!inv) return
      await send.mutateAsync(inv._id)
      navigate(`/invoices/${inv._id}`)
    } catch {
      // Reported by the mutation.
    }
  }

  const busy = create.isPending || update.isPending || send.isPending
  const loading = isEdit && !hydrated

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="mb-6 md:mb-8">
        <Link
          to={isEdit ? `/invoices/${id}` : '/invoices'}
          className="inline-flex items-center gap-2 text-[13px] text-graphite hover:text-ink"
        >
          <ArrowLeft size={14} /> {isEdit ? 'Back to invoice' : 'All invoices'}
        </Link>
        <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="t-eyebrow text-mute mb-3">Sales</div>
            <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
              {isEdit
                ? `Edit ${existing.data?.data?.invoice.invoiceNumber ?? 'invoice'}`
                : 'New invoice'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onSaveDraft}
              disabled={busy || loading}
            >
              {create.isPending || update.isPending ? (
                <>
                  <Spinner size={14} /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} strokeWidth={1.8} /> Save draft
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ink"
              size="md"
              onClick={onSend}
              disabled={busy || loading}
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="border border-hairline-soft bg-paper px-4 py-10 text-center t-body-s text-mute">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 md:gap-6 items-start">
          <div className="flex flex-col gap-5 md:gap-6 min-w-0">
            <CustomerCard customer={customer} onChange={setCustomer} />

            {/* Lines */}
            <div className="border border-hairline-soft bg-paper p-5 md:p-6">
              <div className="t-eyebrow text-mute mb-4">Lines</div>
              <ProductPicker onPick={addCatalogueLine} />

              {lines.length === 0 ? (
                <div className="mt-4 border border-dashed border-hairline px-4 py-6 text-center t-body-s text-mute">
                  Search the catalogue above or add a custom line.
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {lines.map((l) => (
                    <LineRow
                      key={l.key}
                      line={l}
                      onPatch={(patch) => patchLine(l.key, patch)}
                      onRemove={() => removeLine(l.key)}
                    />
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="secondary"
                size="md"
                className="mt-4"
                onClick={addCustomLine}
              >
                <Plus size={14} strokeWidth={1.8} /> Add custom line
              </Button>
            </div>

            {/* Extras */}
            <div className="border border-hairline-soft bg-paper p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Discount (₦)">
                <input
                  type="number"
                  min={0}
                  value={discountNaira}
                  onChange={(e) => setDiscountNaira(e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
              <Field label="Due date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div>
                <Toggle checked={vatEnabled} onChange={setVatEnabled} label="Charge VAT" />
                {vatEnabled ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={vatPercent}
                      onChange={(e) => setVatPercent(e.target.value)}
                      className={cn(inputClass, 'max-w-28')}
                    />
                    <span className="text-[13px] text-mute">
                      percent, charged after the discount
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <Toggle
                  checked={shippingEnabled}
                  onChange={setShippingEnabled}
                  label="Add shipping"
                />
                {shippingEnabled ? (
                  <div className="mt-3 grid grid-cols-[1fr_120px] gap-2">
                    <input
                      type="text"
                      value={shippingLabel}
                      onChange={(e) => setShippingLabel(e.target.value)}
                      placeholder="Delivery"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min={0}
                      value={shippingNaira}
                      onChange={(e) => setShippingNaira(e.target.value)}
                      placeholder="₦"
                      className={inputClass}
                    />
                  </div>
                ) : null}
              </div>

              <Field label="Notes shown on the invoice" className="md:col-span-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Payment terms, delivery notes, a thank you…"
                  className="w-full border border-hairline bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
                />
              </Field>
            </div>
          </div>

          {/* Totals panel */}
          <aside className="border border-hairline-soft bg-paper p-5 md:p-6 xl:sticky xl:top-6">
            <div className="t-eyebrow text-mute mb-4">Totals</div>
            <dl className="m-0 flex flex-col gap-2 text-[14px]">
              <Row label="Subtotal" value={formatNaira(totals.subtotal)} />
              {totals.discount > 0 ? (
                <Row label="Discount" value={`− ${formatNaira(totals.discount)}`} />
              ) : null}
              {vatEnabled ? (
                <Row label={`VAT (${Number(vatPercent) || 0}%)`} value={formatNaira(totals.vat)} />
              ) : null}
              {shippingEnabled ? (
                <Row label={shippingLabel || 'Delivery'} value={formatNaira(totals.shipping)} />
              ) : null}
            </dl>
            <div className="mt-4 pt-4 border-t border-hairline flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
                Grand total
              </span>
              <span className="font-display italic font-semibold text-[28px] leading-none text-ink">
                {formatNaira(totals.total)}
              </span>
            </div>
            {stockProblems.length > 0 ? (
              <div className="mt-4 border border-coral bg-blush px-3 py-2 text-[12.5px] text-ink">
                {stockProblems.length === 1
                  ? 'One line exceeds'
                  : `${stockProblems.length} lines exceed`}{' '}
                available stock. The invoice can be saved but not sent.
              </div>
            ) : null}
          </aside>
        </div>
      )}
    </section>
  )
}

// ─── Customer card ───────────────────────────────────────────────

function CustomerCard({
  customer,
  onChange,
}: {
  customer: DraftCustomer
  onChange: (c: DraftCustomer) => void
}) {
  const [mode, setMode] = useState<'customers' | 'orgs'>('customers')
  const [q, setQ] = useState('')
  const term = q.trim()

  const customers = useAdminCustomers({ q: term || undefined, pageSize: 8, role: 'customer' })
  const orgs = useAdminPartnerships({ q: term || undefined, pageSize: 8 })
  const customerItems: AdminCustomerListItem[] = customers.data?.data?.items ?? []
  const orgItems: B2BOrg[] = orgs.data?.data?.items ?? []
  const showResults = term.length > 0

  const pickCustomer = (c: AdminCustomerListItem) => {
    onChange({
      ...customer,
      name: c.name,
      email: c.email,
      phone: c.phone ?? '',
      // Guests have no account, their key is an email, so only link real users.
      userId: c.userId,
      b2bOrgId: null,
    })
    setQ('')
  }
  const pickOrg = (o: B2BOrg) => {
    onChange({
      ...customer,
      name: o.contactName ? `${o.name} (${o.contactName})` : o.name,
      email: o.contactEmail,
      phone: o.contactPhone ?? '',
      b2bOrgId: o._id,
      userId: null,
    })
    setQ('')
  }

  const linked = customer.userId
    ? 'Linked to a registered customer'
    : customer.b2bOrgId
      ? 'Linked to an organisation'
      : null

  return (
    <div className="border border-hairline-soft bg-paper p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="t-eyebrow text-mute">Bill to</div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {(
            [
              { id: 'customers', label: 'Customers' },
              { id: 'orgs', label: 'Organisations' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                'px-3 py-1.5 text-[11px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                mode === m.id ? 'bg-ink text-paper' : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.6}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            mode === 'customers' ? 'Find an existing customer…' : 'Find an organisation…'
          }
          className={cn(inputClass, 'pl-9')}
        />
        {showResults ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 border border-hairline bg-paper shadow-[0_16px_40px_-20px_rgba(26,20,16,0.25)] max-h-72 overflow-y-auto">
            {mode === 'customers' ? (
              customerItems.length === 0 ? (
                <EmptyPick loading={customers.isFetching} />
              ) : (
                customerItems.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => pickCustomer(c)}
                    className="w-full text-left px-4 py-3 hover:bg-cream-soft border-b border-hairline-soft last:border-b-0"
                  >
                    <div className="text-[14px] text-ink">{c.name}</div>
                    <div className="text-[12px] text-mute">{c.email}</div>
                  </button>
                ))
              )
            ) : orgItems.length === 0 ? (
              <EmptyPick loading={orgs.isFetching} />
            ) : (
              orgItems.map((o) => (
                <button
                  key={o._id}
                  type="button"
                  onClick={() => pickOrg(o)}
                  className="w-full text-left px-4 py-3 hover:bg-cream-soft border-b border-hairline-soft last:border-b-0"
                >
                  <div className="text-[14px] text-ink">{o.name}</div>
                  <div className="text-[12px] text-mute">
                    {o.contactName} · {o.contactEmail}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onChange({ ...customer, name: e.target.value })}
            placeholder="Who is paying"
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={customer.email}
            onChange={(e) => onChange({ ...customer, email: e.target.value })}
            placeholder="Where the invoice goes"
            className={inputClass}
          />
        </Field>
        <Field label="Phone (optional)">
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => onChange({ ...customer, phone: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Address (optional)">
          <input
            type="text"
            value={customer.address}
            onChange={(e) => onChange({ ...customer, address: e.target.value })}
            placeholder="Printed under their name"
            className={inputClass}
          />
        </Field>
      </div>

      {linked ? (
        <div className="mt-3 flex items-center gap-2 text-[12px] text-mute">
          <span className="font-mono uppercase tracking-widest">{linked}</span>
          <button
            type="button"
            onClick={() => onChange({ ...customer, userId: null, b2bOrgId: null })}
            className="inline-flex items-center gap-1 text-ink underline underline-offset-2"
          >
            <X size={11} /> Unlink
          </button>
        </div>
      ) : null}
    </div>
  )
}

function EmptyPick({ loading }: { loading: boolean }) {
  return (
    <div className="px-4 py-3 text-[13px] text-mute">
      {loading ? 'Searching…' : 'No matches. You can type the details below instead.'}
    </div>
  )
}

// ─── Product picker ──────────────────────────────────────────────

function ProductPicker({
  onPick,
}: {
  onPick: (product: InvoiceProductPick, variant: InvoiceProductPick['variants'][number]) => void
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const products = useInvoiceProducts(q.trim())
  const items = products.data?.data?.products ?? []

  return (
    <div className="relative">
      <Search
        size={16}
        strokeWidth={1.6}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder="Search the catalogue to add a product…"
        className={cn(inputClass, 'pl-9')}
      />
      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 border border-hairline bg-paper shadow-[0_16px_40px_-20px_rgba(26,20,16,0.25)] max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-mute">
              {products.isFetching ? 'Searching…' : 'No products found.'}
            </div>
          ) : (
            items.map((p) => (
              <div key={p.productId} className="border-b border-hairline-soft last:border-b-0">
                <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
                  {p.name}
                  {p.isSoldOut ? <span className="ml-2 text-berry">Sold out</span> : null}
                </div>
                {p.variants
                  .filter((v) => v.isActive)
                  .map((v) => {
                    const out = p.isSoldOut || v.stockCount <= 0
                    return (
                      <button
                        key={v.variantId}
                        type="button"
                        disabled={out}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onPick(p, v)
                          setOpen(false)
                        }}
                        className="w-full flex items-center justify-between gap-3 text-left px-4 py-2.5 hover:bg-cream-soft disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="text-[14px] text-ink">{v.label}</span>
                        <span className="flex items-center gap-3 shrink-0">
                          <span
                            className={cn(
                              'text-[11px] font-mono uppercase tracking-widest',
                              v.stockCount <= 3 ? 'text-berry' : 'text-mute',
                            )}
                          >
                            {v.stockCount} in stock
                          </span>
                          <span className="text-[13px] text-graphite">
                            {formatNaira(v.unitPrice)}
                          </span>
                        </span>
                      </button>
                    )
                  })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

// ─── Line row ────────────────────────────────────────────────────

function LineRow({
  line,
  onPatch,
  onRemove,
}: {
  line: DraftLine
  onPatch: (patch: Partial<DraftLine>) => void
  onRemove: () => void
}) {
  const overStock =
    line.kind === 'catalogue' && line.stockCount != null && line.qty > line.stockCount
  const lineTotal = nairaToKobo(line.unitPriceNaira) * line.qty

  return (
    <div
      className={cn(
        'border p-4 grid grid-cols-1 md:grid-cols-[1fr_130px_90px_120px_auto] gap-3 items-start',
        overStock ? 'border-coral bg-blush/40' : 'border-hairline-soft',
      )}
    >
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
          {line.kind === 'catalogue' ? 'Product' : 'Custom line'}
        </div>
        <input
          type="text"
          value={line.description}
          onChange={(e) => onPatch({ description: e.target.value })}
          placeholder={line.kind === 'custom' ? 'Describe the item or service' : undefined}
          className={inputClass}
        />
        {line.kind === 'catalogue' ? (
          <div className="mt-1.5 flex items-center gap-2 text-[12px]">
            {line.variantLabel ? <span className="text-graphite">{line.variantLabel}</span> : null}
            {line.stockCount != null ? (
              <span
                className={cn(
                  'font-mono uppercase tracking-widest',
                  overStock ? 'text-berry' : 'text-mute',
                )}
              >
                {line.stockCount} in stock
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <Field label="Price (₦)">
        <input
          type="number"
          min={0}
          value={line.unitPriceNaira}
          onChange={(e) => onPatch({ unitPriceNaira: e.target.value })}
          placeholder="0"
          className={inputClass}
        />
      </Field>
      <Field label="Qty">
        <input
          type="number"
          min={1}
          value={line.qty}
          onChange={(e) => onPatch({ qty: Math.max(1, Math.round(Number(e.target.value)) || 1) })}
          className={inputClass}
        />
      </Field>
      <Field label="Total">
        <div className="h-11 flex items-center text-[15px] text-ink font-medium">
          {formatNaira(lineTotal)}
        </div>
      </Field>
      {/* Same label height as the inputs so the button lines up with them. */}
      <Field label="" className="hidden md:block">
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove line"
          className="inline-flex h-11 w-11 items-center justify-center text-mute hover:text-err hover:bg-blush rounded-sm"
        >
          <Trash2 size={15} strokeWidth={1.6} />
        </button>
      </Field>
      <button
        type="button"
        onClick={onRemove}
        className="md:hidden inline-flex items-center gap-2 text-[13px] text-mute hover:text-err"
      >
        <Trash2 size={14} strokeWidth={1.6} /> Remove line
      </button>
    </div>
  )
}

// ─── Small blocks ────────────────────────────────────────────────

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono mb-2">
        {/* A blank label keeps its height so columns without one still line up. */}
        {label || ' '}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none h-11">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-(--pink)"
      />
      <span className="text-[14px] text-ink">{label}</span>
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-graphite">{label}</dt>
      <dd className="m-0 text-ink">{value}</dd>
    </div>
  )
}
