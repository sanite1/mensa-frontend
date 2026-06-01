// ═══════════════════════════════════════════════════════════════
// /customers (admin)
//
// Searchable, paginated customer list. Search runs server side so
// it works against the full user table, not just the page loaded.
// Each row links to /customers/:id for the detail view.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

import {
  useAdminCustomers,
  type AdminCustomerListItem,
  type CustomerRole,
} from '@/lib/network/api/admin.api'
import { formatNaira, cn } from '@/lib/utils'

const ROLE_FILTERS: { id: CustomerRole | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customer', label: 'Customers' },
  { id: 'b2b_admin', label: 'B2B admins' },
  { id: 'b2b_member', label: 'B2B members' },
  { id: 'admin', label: 'Mensa admins' },
]

const ROLE_LABEL: Record<CustomerRole, string> = {
  customer: 'Customer',
  admin: 'Admin',
  b2b_admin: 'B2B admin',
  b2b_member: 'B2B member',
}

const PAGE_SIZE = 24

export function CustomersListPage() {
  const [role, setRole] = useState<CustomerRole | 'all'>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      role: role === 'all' ? undefined : role,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [role, q, page],
  )

  const query = useAdminCustomers(params)
  const items: AdminCustomerListItem[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <div className="t-eyebrow text-mute mb-3">Audience</div>
        <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
          Customers
        </h1>
        <p className="t-body-s mt-2 text-graphite max-w-180">
          Everyone with a Mensa account. Search by name, email, or phone. Click a row to see their
          order history.
        </p>
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
            placeholder="Search name, email, phone…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <div className="inline-flex border border-hairline bg-paper overflow-hidden">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setRole(f.id)
                setPage(1)
              }}
              className={cn(
                'px-3 py-2 text-[12px] uppercase tracking-widest font-medium border-r border-hairline last:border-r-0',
                role === f.id ? 'bg-ink text-paper' : 'bg-paper text-graphite hover:bg-cream-soft',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-hairline-soft bg-paper overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left border-b border-hairline-soft">
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Lifetime</Th>
              <Th>Joined</Th>
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
                  {q ? 'No customers matched your search.' : 'No customers yet.'}
                </td>
              </tr>
            ) : (
              items.map((c: AdminCustomerListItem) => (
                <tr
                  key={c._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td>
                    <Link
                      to={`/customers/${c._id}`}
                      className="text-ink font-medium no-underline hover:text-pink-deep"
                    >
                      {c.name}
                    </Link>
                  </Td>
                  <Td className="text-graphite">{c.email}</Td>
                  <Td className="text-graphite">{c.phone}</Td>
                  <Td>
                    <span className="text-[11px] uppercase tracking-widest font-medium text-mute">
                      {ROLE_LABEL[c.role]}
                    </span>
                  </Td>
                  <Td className="text-right">{c.orderCount}</Td>
                  <Td className="text-right font-medium">
                    {formatNaira(c.lifetimeValueKobo)}
                  </Td>
                  <Td className="text-mute">
                    {new Date(c.createdAt).toLocaleDateString('en-NG', {
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

      {/* Pagination */}
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
