// /invoices (admin) — every invoice with status filters and search.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ClickableRow } from '@/modules/admin/components/ClickableRow'
import {
  useAdminInvoices,
  type AdminListInvoicesParams,
  type Invoice,
  type InvoiceStatus,
} from '@/lib/network/api/invoice.api'
import { formatNaira, cn } from '@/lib/utils'
import { InvoiceStatusPill, formatDate } from './invoiceShared'

type Filter = 'all' | InvoiceStatus | 'overdue'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'viewed', label: 'Viewed' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'paid', label: 'Paid' },
  { id: 'void', label: 'Void' },
]

const PAGE_SIZE = 50

export function InvoicesListPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: AdminListInvoicesParams = useMemo(
    () => ({
      status: filter === 'all' ? undefined : filter,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [filter, q, page],
  )

  const query = useAdminInvoices(params)
  const items: Invoice[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Sales</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Invoices
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Bill anyone by link. Sent invoices hold stock until they are paid or voided.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="md">
            <Link to="/invoices/settings">
              <Settings2 size={14} strokeWidth={1.8} />
              Bank details
            </Link>
          </Button>
          <Button asChild variant="ink" size="md">
            <Link to="/invoices/new">
              <Plus size={14} strokeWidth={1.8} />
              New invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 flex-wrap mb-5 md:mb-6">
        <div className="relative flex-1 min-w-full sm:min-w-60 max-w-full sm:max-w-105">
          <Search
            size={16}
            strokeWidth={1.6}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Search number, name or email…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-x-auto max-w-full">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id)
                setPage(1)
              }}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0 whitespace-nowrap',
                filter === f.id
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left border-b border-hairline-soft">
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Due</Th>
              <Th>Created</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-mute t-body-s">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-mute t-body-s">
                  No invoices match these filters.
                </td>
              </tr>
            ) : (
              items.map((inv) => (
                <ClickableRow
                  key={inv._id}
                  to={`/invoices/${inv._id}`}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td>
                    <Link
                      to={`/invoices/${inv._id}`}
                      className="font-mono text-[13px] text-ink underline-offset-2 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </Td>
                  <Td>
                    <div className="text-ink">{inv.customer.name}</div>
                    <div className="text-[12px] text-mute">{inv.customer.email}</div>
                  </Td>
                  <Td>
                    <InvoiceStatusPill invoice={inv} />
                  </Td>
                  <Td className="text-mute text-[12px]">{formatDate(inv.dueDate)}</Td>
                  <Td className="text-mute text-[12px]">{formatDate(inv.createdAt)}</Td>
                  <Td className="text-right text-ink font-medium whitespace-nowrap">
                    {formatNaira(inv.totals.total)}
                  </Td>
                </ClickableRow>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-[12px] uppercase tracking-widest font-medium text-mute">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </div>
          <div className="inline-flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-[11px] uppercase tracking-widest font-medium text-mute font-mono',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-top', className)}>{children}</td>
}
