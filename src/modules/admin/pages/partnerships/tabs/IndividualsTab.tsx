// Individuals (partner programme) sub-view inside /partnerships (admin).
// Lists Partner applications across statuses, links each to a detail
// page where admin can approve, reject, or update.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import {
  useAdminPartners,
  type AdminListPartnersParams,
} from '@/lib/network/api/partner.api'
import type {
  PartnerStatus,
  PartnerSummary,
} from '@/lib/network/types/partner.types'
import { formatNaira, cn } from '@/lib/utils'

const STATUS_FILTERS: { id: 'all' | PartnerStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

const PAGE_SIZE = 24

export function IndividualsTab() {
  const [status, setStatus] = useState<'all' | PartnerStatus>('pending')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: AdminListPartnersParams = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, q, page],
  )

  const query = useAdminPartners(params)
  const items: PartnerSummary[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  return (
    <div>
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
            placeholder="Search name, email, social handle…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setStatus(f.id)
                setPage(1)
              }}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                status === f.id
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
              <Th>Partner</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th>Code</Th>
              <Th className="text-right">Rate</Th>
              <Th className="text-right">Lifetime</Th>
              <Th>Applied</Th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-mute t-body-s">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-mute t-body-s">
                  {status === 'pending'
                    ? 'No pending applications.'
                    : 'No matching partners.'}
                </td>
              </tr>
            ) : (
              items.map((p: PartnerSummary) => (
                <tr
                  key={p._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td>
                    <Link
                      to={`/partnerships/individuals/${p._id}`}
                      className="text-ink font-medium no-underline hover:text-pink-deep"
                    >
                      {p.name}
                    </Link>
                    {p.socialHandle ? (
                      <div className="text-[12px] text-graphite">{p.socialHandle}</div>
                    ) : null}
                  </Td>
                  <Td>
                    <div className="text-ink">{p.email}</div>
                    <div className="text-[12px] text-graphite">{p.phone}</div>
                  </Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td>
                    {p.referralCode ? (
                      <span className="font-mono text-[12px] text-ink">{p.referralCode}</span>
                    ) : (
                      <span className="text-mute text-[12px]">—</span>
                    )}
                  </Td>
                  <Td className="text-right">{p.commissionRate}%</Td>
                  <Td className="text-right font-medium">
                    {formatNaira(p.lifetimeEarnedKobo)}
                  </Td>
                  <Td className="text-mute text-[12px]">
                    {new Date(p.createdAt).toLocaleDateString('en-NG', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
              onClick={() => setPage((n: number) => Math.max(1, n - 1))}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((n: number) => n + 1)}
              className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function StatusBadge({ status }: { status: PartnerStatus }) {
  const map: Record<PartnerStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-cream text-mute' },
    approved: { label: 'Approved', cls: 'bg-blush text-berry' },
    active: { label: 'Active', cls: 'bg-ok/10 text-ok' },
    suspended: { label: 'Suspended', cls: 'bg-err/10 text-err' },
    rejected: { label: 'Rejected', cls: 'bg-err/10 text-err' },
  }
  const { label, cls } = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono rounded-sm',
        cls,
      )}
    >
      {label}
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
