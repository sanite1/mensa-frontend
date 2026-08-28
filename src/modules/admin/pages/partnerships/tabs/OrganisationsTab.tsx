// Organisations sub-view inside /partnerships (admin), lifted out of PartnershipsListPage.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import { useAdminPartnerships, type AdminPartnershipsListParams } from '@/lib/network/api/b2b.api'
import type { B2BOrg, B2BOrgType, B2BVerificationStatus } from '@/lib/network/types/b2b.types'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { id: 'all' | B2BVerificationStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

const TYPE_LABEL: Record<B2BOrgType, string> = {
  school: 'School',
  ngo: 'NGO',
  council: 'Council',
  other: 'Other',
}

const PAGE_SIZE = 24

export function OrganisationsTab() {
  const [status, setStatus] = useState<'all' | B2BVerificationStatus>('pending')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: AdminPartnershipsListParams = useMemo(
    () => ({
      verificationStatus: status === 'all' ? undefined : status,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, q, page],
  )

  const query = useAdminPartnerships(params)
  const items: B2BOrg[] = query.data?.data?.items ?? []
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
            placeholder="Search name, contact, email…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
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
              <Th>Organisation</Th>
              <Th>Type</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
              <Th>Applied</Th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mute t-body-s">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mute t-body-s">
                  {status === 'pending' ? 'No pending applications.' : 'No matching partnerships.'}
                </td>
              </tr>
            ) : (
              items.map((o: B2BOrg) => (
                <tr
                  key={o._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td>
                    <Link
                      to={`/partnerships/${o._id}`}
                      className="text-ink font-medium no-underline hover:text-pink-deep"
                    >
                      {o.name}
                    </Link>
                    {o.registrationNumber ? (
                      <div className="text-[11px] font-mono text-mute">
                        RC {o.registrationNumber}
                      </div>
                    ) : null}
                  </Td>
                  <Td>
                    <span className="text-[11px] uppercase tracking-widest font-medium text-mute">
                      {TYPE_LABEL[o.type]}
                    </span>
                  </Td>
                  <Td>
                    <div className="text-ink">{o.contactName}</div>
                    <div className="text-[12px] text-graphite">{o.contactEmail}</div>
                  </Td>
                  <Td>
                    <StatusBadge status={o.verificationStatus} />
                  </Td>
                  <Td className="text-mute text-[12px]">
                    {new Date(o.createdAt).toLocaleDateString('en-NG', {
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
        <Pager
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPage={setPage}
        />
      ) : null}
    </div>
  )
}

function StatusBadge({ status }: { status: B2BVerificationStatus }) {
  const map: Record<B2BVerificationStatus, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-cream text-mute' },
    verified: { label: 'Verified', cls: 'bg-ok/10 text-ok' },
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
      {children}
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}

function Pager({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  onPage: (p: number) => void
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <div className="text-[12px] uppercase tracking-widest font-medium text-mute">
        Page {page} of {totalPages} · {total} total
      </div>
      <div className="inline-flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(Math.max(1, page - 1))}
          className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="px-3 py-2 border border-hairline bg-paper text-[12px] uppercase tracking-widest font-medium disabled:opacity-40 hover:bg-cream-soft"
        >
          Next
        </button>
      </div>
    </div>
  )
}
