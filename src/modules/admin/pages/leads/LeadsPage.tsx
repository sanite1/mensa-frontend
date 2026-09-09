// /leads (admin) — starter set finder leads. 'New' leads saw their
// recommendation but have not ordered yet, that is the follow up list.

import { useMemo, useState } from 'react'
import { Search, Trash2, Download, Check, Undo2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm'
import {
  useAdminLeads,
  useDeleteLead,
  useUpdateLeadStatus,
  type AdminListLeadsParams,
  type LeadResultCode,
  type LeadStatus,
  type StarterSetLead,
} from '@/lib/network/api/lead.api'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { id: 'all' | LeadStatus; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'ordered', label: 'Ordered' },
  { id: 'all', label: 'All' },
]

const RESULT_LABEL: Record<LeadResultCode, string> = {
  PADS: 'Pack of Pads',
  PANT1: 'Single Pant',
  PANT3: 'Pack of 3 Pants',
  PANT5: 'Pack of 5 Pants',
  PANT1_PADS: 'Single Pant + Pads',
  PANT3_PADS: '3 Pants + Pads',
}

const PAGE_SIZE = 50

export function LeadsPage() {
  const [status, setStatus] = useState<'all' | LeadStatus>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: AdminListLeadsParams = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, q, page],
  )

  const query = useAdminLeads(params)
  const statusMutation = useUpdateLeadStatus()
  const deleteMutation = useDeleteLead()
  const items: StarterSetLead[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  const onExportCsv = () => {
    if (items.length === 0) return
    const header = 'name,email,recommended,status,orderNumber,createdAt\n'
    const rows = items
      .map(
        (l: StarterSetLead) =>
          `${csv(l.name)},${csv(l.email)},${csv(RESULT_LABEL[l.resultCode] ?? l.resultCode)},${csv(l.status)},${csv(l.orderNumber ?? '')},${csv(l.createdAt)}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mensa-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onDelete = async (lead: StarterSetLead) => {
    const ok = await confirm({
      title: `Remove ${lead.email}?`,
      description: 'The lead and their quiz answers are deleted for good.',
      confirmLabel: 'Remove',
      tone: 'destructive',
    })
    if (!ok) return
    deleteMutation.mutate(lead._id)
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Audience</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Leads
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Everyone who completed the starter set finder. New leads have not ordered yet, follow up
            with them to learn what held them back.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onExportCsv}
          disabled={items.length === 0}
        >
          <Download size={14} strokeWidth={1.8} />
          Export CSV
        </Button>
      </div>

      {/* Toolbar */}
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
            placeholder="Search name or email…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <FilterPills
          items={STATUS_FILTERS}
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
        />
      </div>

      {/* Table */}
      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left border-b border-hairline-soft">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Recommended</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
              <Th className="text-right">Actions</Th>
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
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              items.map((l: StarterSetLead) => (
                <tr
                  key={l._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td className="text-ink">{l.name}</Td>
                  <Td className="text-ink">{l.email}</Td>
                  <Td>
                    <span className="text-[12.5px] text-graphite">
                      {RESULT_LABEL[l.resultCode] ?? l.resultCode}
                    </span>
                    {l.retakes > 0 ? (
                      <span className="ml-2 text-[10px] uppercase tracking-widest font-medium font-mono text-mute">
                        {l.retakes + 1}x
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <StatusBadge status={l.status} orderNumber={l.orderNumber} />
                  </Td>
                  <Td className="text-mute text-[12px]">{formatDate(l.createdAt)}</Td>
                  <Td className="text-right whitespace-nowrap">
                    {l.status === 'new' ? (
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate({ id: l._id, status: 'contacted' })}
                        disabled={statusMutation.isPending}
                        title="Mark as contacted"
                        className="inline-flex h-8 items-center gap-1.5 px-2 text-[11px] uppercase tracking-widest font-medium text-graphite hover:text-ink hover:bg-cream rounded-sm"
                      >
                        <Check size={13} strokeWidth={1.8} /> Contacted
                      </button>
                    ) : l.status === 'contacted' ? (
                      <button
                        type="button"
                        onClick={() => statusMutation.mutate({ id: l._id, status: 'new' })}
                        disabled={statusMutation.isPending}
                        title="Move back to new"
                        className="inline-flex h-8 items-center gap-1.5 px-2 text-[11px] uppercase tracking-widest font-medium text-mute hover:text-ink hover:bg-cream rounded-sm"
                      >
                        <Undo2 size={13} strokeWidth={1.8} /> Undo
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onDelete(l)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Remove ${l.email}`}
                      className="inline-flex h-8 w-8 items-center justify-center text-mute hover:text-err hover:bg-blush rounded-sm"
                    >
                      <Trash2 size={14} strokeWidth={1.6} />
                    </button>
                  </Td>
                </tr>
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
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p: number) => p + 1)}
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

function FilterPills<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex border border-hairline bg-paper overflow-hidden">
      {items.map((f: { id: T; label: string }) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
            value === f.id ? 'bg-ink text-paper' : 'bg-paper text-graphite hover:bg-cream-soft',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status, orderNumber }: { status: LeadStatus; orderNumber?: string | null }) {
  if (status === 'ordered') {
    return (
      <span
        title={orderNumber ? `Order ${orderNumber}` : undefined}
        className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-ok/10 text-ok rounded-sm"
      >
        Ordered
      </span>
    )
  }
  if (status === 'contacted') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-cream text-graphite rounded-sm">
        Contacted
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-blush text-berry rounded-sm">
      New
    </span>
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

/** Quote a CSV cell — wrap in double quotes and escape embedded quotes. */
function csv(value: string): string {
  const needsQuote = /[",\n]/.test(value)
  const escaped = value.replace(/"/g, '""')
  return needsQuote ? `"${escaped}"` : escaped
}
