// ═══════════════════════════════════════════════════════════════
// /content (admin)
//
// Lists all journal + education posts with filters. Acts as the
// jump-off to ContentEditorPage for create and edit.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAdminContent, type ContentListParams } from '@/lib/network/api/content.api'
import type {
  ContentKind,
  ContentPost,
  ContentCategory,
} from '@/lib/network/types/content.types'
import { cn } from '@/lib/utils'

const KIND_FILTERS: { id: ContentKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'journal', label: 'Journal' },
  { id: 'education', label: 'Education' },
]

const STATUS_FILTERS: { id: 'all' | 'draft' | 'published'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
]

const CATEGORY_LABEL: Record<ContentCategory, string> = {
  classroom: 'Classroom',
  product: 'Product',
  community: 'Community',
  policy: 'Policy',
  care: 'Care',
}

const PAGE_SIZE = 24

export function ContentListPage() {
  const [kind, setKind] = useState<ContentKind | 'all'>('all')
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const params: ContentListParams = useMemo(
    () => ({
      kind: kind === 'all' ? undefined : kind,
      status: status === 'all' ? undefined : status,
      q: q.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [kind, status, q, page],
  )

  const query = useAdminContent(params)
  const items: ContentPost[] = query.data?.data?.items ?? []
  const pagination = query.data?.data?.pagination

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Editorial</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            Content
          </h1>
          <p className="t-body-s mt-2 text-graphite max-w-180">
            Journal posts and education guides. Drafts stay invisible to the public until you flip
            them to published.
          </p>
        </div>
        <Button asChild variant="primary" size="md">
          <Link to="/content/new">
            <Plus size={14} strokeWidth={2} />
            New post
          </Link>
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
            placeholder="Search title or excerpt…"
            className="h-11 w-full pl-9 pr-3 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>
        <FilterPills
          items={KIND_FILTERS}
          value={kind}
          onChange={(v) => {
            setKind(v)
            setPage(1)
          }}
        />
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
              <Th>Title</Th>
              <Th>Kind</Th>
              <Th>Category</Th>
              <Th>Author</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
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
                  No posts yet.{' '}
                  <Link to="/content/new" className="text-ink underline underline-offset-2">
                    Write the first.
                  </Link>
                </td>
              </tr>
            ) : (
              items.map((p: ContentPost) => (
                <tr
                  key={p._id}
                  className="border-b border-hairline-soft last:border-b-0 hover:bg-cream-soft"
                >
                  <Td>
                    <Link
                      to={`/content/${p._id}/edit`}
                      className="text-ink font-medium no-underline hover:text-pink-deep"
                    >
                      {p.title}
                    </Link>
                    <div className="text-[11px] font-mono text-mute truncate">{p.slug}</div>
                  </Td>
                  <Td>
                    <span className="text-[11px] uppercase tracking-widest font-medium text-mute">
                      {p.kind}
                    </span>
                  </Td>
                  <Td className="text-graphite">{CATEGORY_LABEL[p.category]}</Td>
                  <Td className="text-graphite">{p.authorName}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="text-mute text-[12px]">
                    {new Date(p.updatedAt).toLocaleDateString('en-NG', {
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

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-ok/10 text-ok rounded-sm">
        Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium font-mono bg-cream text-mute rounded-sm">
      Draft
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

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}
