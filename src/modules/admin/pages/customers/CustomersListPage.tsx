// /customers (admin) — everyone who has bought from Mensa or signed up.
// Built from orders, so guest checkouts count too. Click a row to open.

import { useMemo, useState } from 'react'
import { Search, Download } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ClickableRow } from '@/modules/admin/components/ClickableRow'
import {
  fetchAllCustomers,
  useAdminCustomers,
  type AdminCustomerListItem,
  type CustomerKind,
} from '@/lib/network/api/admin.api'
import { formatNaira, cn } from '@/lib/utils'

const KIND_FILTERS: { id: CustomerKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'account', label: 'With account' },
  { id: 'guest', label: 'Guest checkout' },
]

const PAGE_SIZE = 24

export function CustomersListPage() {
  const [kind, setKind] = useState<CustomerKind | 'all'>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  const params = useMemo(
    () => ({
      kind: kind === 'all' ? undefined : kind,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [kind, q, page],
  )

  const query = useAdminCustomers(params)
  const items: AdminCustomerListItem[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  const onExportCsv = async () => {
    setExporting(true)
    try {
      const all = await fetchAllCustomers({ kind: params.kind, q: params.q })
      if (all.length === 0) {
        toast.message('Nothing to export for these filters.')
        return
      }
      const header =
        'name,email,phone,state,account,orders,paidOrders,lifetimeValueNaira,firstOrderAt,lastOrderAt\n'
      const rows = all
        .map((c) =>
          [
            c.name,
            c.email,
            c.phone,
            c.state ?? '',
            c.hasAccount ? 'yes' : 'guest',
            String(c.orderCount),
            String(c.paidOrderCount),
            String(c.lifetimeValueKobo / 100),
            c.firstOrderAt ?? '',
            c.lastOrderAt ?? '',
          ]
            .map(csv)
            .join(','),
        )
        .join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mensa-customers-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${all.length} customer${all.length === 1 ? '' : 's'}.`)
    } catch {
      toast.error('Could not export customers. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Audience</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Customers
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Everyone who has ordered from Mensa or created an account, including guest checkouts.
            Click a row for their order history.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onExportCsv}
          disabled={exporting || query.isLoading}
        >
          {exporting ? (
            <>
              <Spinner size={14} /> Exporting…
            </>
          ) : (
            <>
              <Download size={14} strokeWidth={1.8} /> Export CSV
            </>
          )}
        </Button>
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
            placeholder="Search name, email, phone…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setKind(f.id)
                setPage(1)
              }}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                kind === f.id ? 'bg-ink text-paper' : 'bg-paper text-graphite hover:bg-cream-soft',
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
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>State</Th>
              <Th>Account</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Lifetime</Th>
              <Th>Last order</Th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-mute t-body-s">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-mute t-body-s">
                  {q ? 'No customers matched your search.' : 'No customers yet.'}
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <ClickableRow
                  key={c._id}
                  to={`/customers/${encodeURIComponent(c._id)}`}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td className="text-ink font-medium">{c.name}</Td>
                  <Td className="text-graphite">{c.email}</Td>
                  <Td className="text-graphite">{c.phone || '—'}</Td>
                  <Td className="text-graphite">{c.state ?? '—'}</Td>
                  <Td>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
                        c.hasAccount ? 'bg-ok/10 text-ok' : 'bg-cream text-mute',
                      )}
                    >
                      {c.hasAccount ? 'Account' : 'Guest'}
                    </span>
                  </Td>
                  <Td className="text-right">
                    {c.orderCount}
                    {c.paidOrderCount !== c.orderCount ? (
                      <span className="text-mute text-[12px]"> ({c.paidOrderCount} paid)</span>
                    ) : null}
                  </Td>
                  <Td className="text-right font-medium">{formatNaira(c.lifetimeValueKobo)}</Td>
                  <Td className="text-mute">{formatDate(c.lastOrderAt)}</Td>
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
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** Quote a CSV cell, wrap in double quotes and escape embedded quotes. */
function csv(value: string): string {
  const needsQuote = /[",\n]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuote ? `"${escaped}"` : escaped
}
