// /newsletter (admin) — subscriber list.

import { useMemo, useState } from 'react'
import { Search, Trash2, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm'
import {
  useAdminSubscribers,
  useDeleteSubscriber,
  type AdminListSubscribersParams,
  type NewsletterSource,
  type NewsletterStatus,
  type NewsletterSubscriber,
} from '@/lib/network/api/newsletter.api'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { id: 'all' | NewsletterStatus; label: string }[] = [
  { id: 'subscribed', label: 'Active' },
  { id: 'unsubscribed', label: 'Unsubscribed' },
  { id: 'all', label: 'All' },
]

const SOURCE_LABEL: Record<NewsletterSource, string> = {
  footer: 'Footer',
  mobile_drawer: 'Drawer',
  partner_apply: 'Partner apply',
  checkout: 'Checkout',
  other: 'Other',
}

const PAGE_SIZE = 50

export function NewsletterPage() {
  const [status, setStatus] = useState<'all' | NewsletterStatus>('subscribed')
  const [source, setSource] = useState<'all' | NewsletterSource>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: AdminListSubscribersParams = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      source: source === 'all' ? undefined : source,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, source, q, page],
  )

  const query = useAdminSubscribers(params)
  const deleteMutation = useDeleteSubscriber()
  const items: NewsletterSubscriber[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  const onExportCsv = () => {
    if (items.length === 0) return
    const header = 'email,source,status,subscribedAt\n'
    const rows = items
      .map(
        (s: NewsletterSubscriber) =>
          `${csv(s.email)},${csv(s.source)},${csv(s.status)},${csv(s.subscribedAt)}`,
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mensa-newsletter-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onDelete = async (sub: NewsletterSubscriber) => {
    const ok = await confirm({
      title: `Remove ${sub.email}?`,
      description: 'They can resubscribe later if they want.',
      confirmLabel: 'Remove',
      tone: 'destructive',
    })
    if (!ok) return
    deleteMutation.mutate(sub._id)
  }

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Audience</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Newsletter
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Everyone who has signed up to hear from us. Export to CSV for now while the
            Mailerlite sync is pending.
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
            placeholder="Search email…"
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
        <SourceSelect value={source} onChange={(v) => { setSource(v); setPage(1) }} />
      </div>

      {/* Table */}
      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left border-b border-hairline-soft">
              <Th>Email</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Subscribed</Th>
              <Th>Unsubscribed</Th>
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
                  No subscribers match these filters.
                </td>
              </tr>
            ) : (
              items.map((s: NewsletterSubscriber) => (
                <tr
                  key={s._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td className="text-ink">{s.email}</Td>
                  <Td>
                    <span className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
                      {SOURCE_LABEL[s.source]}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={s.status} />
                  </Td>
                  <Td className="text-mute text-[12px]">{formatDate(s.subscribedAt)}</Td>
                  <Td className="text-mute text-[12px]">
                    {s.unsubscribedAt ? formatDate(s.unsubscribedAt) : '—'}
                  </Td>
                  <Td className="text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(s)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Remove ${s.email}`}
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

function SourceSelect({
  value,
  onChange,
}: {
  value: 'all' | NewsletterSource
  onChange: (v: 'all' | NewsletterSource) => void
}) {
  const options: { value: 'all' | NewsletterSource; label: string }[] = [
    { value: 'all', label: 'All sources' },
    { value: 'footer', label: 'Footer' },
    { value: 'mobile_drawer', label: 'Drawer' },
    { value: 'partner_apply', label: 'Partner apply' },
    { value: 'checkout', label: 'Checkout' },
    { value: 'other', label: 'Other' },
  ]
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'all' | NewsletterSource)}
      className="h-11 border border-hairline bg-paper px-3 py-2 text-[13px] text-ink focus-visible:outline-none focus-visible:border-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function StatusBadge({ status }: { status: NewsletterStatus }) {
  if (status === 'subscribed') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-ok/10 text-ok rounded-sm">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-cream text-mute rounded-sm">
      Unsubscribed
    </span>
  )
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
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

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
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
