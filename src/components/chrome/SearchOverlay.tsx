// ═══════════════════════════════════════════════════════════════
// SearchOverlay
//
// Full-width slide-down that the navbar search icon opens. Searches
// products and journal posts in parallel against the existing
// public list endpoints (both support `?q=`). Debounced 250ms so
// keystrokes don't hammer the API. Closes on Escape, click outside,
// route change, or selecting a result.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'

import { useProducts } from '@/lib/network/api/product.api'
import { useContentList } from '@/lib/network/api/content.api'
import type { Product } from '@/lib/network/types/product.types'
import type { ContentPost } from '@/lib/network/types/content.types'
import { cn } from '@/lib/utils'
import { useFormatPrice } from '@/lib/currency'

const SUGGESTIONS = ['Period pants', 'Reusable pads', 'Starter set', 'Education', 'Sizing']
const DEBOUNCE_MS = 250
const MAX_RESULTS_PER_GROUP = 4

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const debouncedQ = useDebounced(q, DEBOUNCE_MS)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const location = useLocation()

  // Reset every time we open so prior queries don't persist between sessions.
  useEffect(() => {
    if (open) {
      setQ('')
      // setTimeout lets the input mount before we grab focus.
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  // Close on route change so navigating to a result dismisses the overlay.
  useEffect(() => {
    if (open) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const trimmed = debouncedQ.trim()
  const isSearching = trimmed.length >= 2

  const productsQuery = useProducts(
    isSearching ? { q: trimmed, pageSize: MAX_RESULTS_PER_GROUP } : undefined,
  )
  const contentQuery = useContentList(
    isSearching ? { q: trimmed, pageSize: MAX_RESULTS_PER_GROUP } : { pageSize: 1 },
  )

  const products: Product[] = isSearching
    ? (productsQuery.data?.data?.items ?? [])
    : []
  const posts: ContentPost[] = isSearching
    ? (contentQuery.data?.data?.items ?? [])
    : []

  const loading =
    isSearching && (productsQuery.isFetching || contentQuery.isFetching)
  const totalResults = products.length + posts.length

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex flex-col"
    >
      {/* Backdrop — click closes */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 cursor-default"
      />

      {/* Panel */}
      <div className="relative bg-paper border-b border-hairline-soft shadow-lift animate-in slide-in-from-top duration-200">
        {/* Search bar */}
        <div className="max-w-300 mx-auto px-5 md:px-10 lg:px-16 py-5">
          <div className="flex items-center gap-3 border-b-2 border-ink pb-3">
            <Search size={20} strokeWidth={1.6} className="text-ink shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, education guides, journal…"
              aria-label="Search Mensa"
              className="flex-1 min-w-0 bg-transparent border-none outline-none font-display italic text-[clamp(20px,3vw,32px)] text-ink placeholder:text-mute placeholder:italic"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-mute hover:text-ink hover:bg-cream"
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>

          {/* Body */}
          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {!isSearching ? (
              <Suggestions onPick={setQ} />
            ) : loading && totalResults === 0 ? (
              <p className="t-body-s text-mute">Searching…</p>
            ) : totalResults === 0 ? (
              <NoMatches q={trimmed} />
            ) : (
              <ResultsBody products={products} posts={posts} q={trimmed} onSelect={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sections ────────────────────────────────────────────────────

function Suggestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div>
      <div className="t-eyebrow text-mute mb-3">Popular searches</div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="px-3.5 py-1.5 text-[13px] border border-hairline rounded-full bg-paper text-graphite hover:border-ink hover:text-ink transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function NoMatches({ q }: { q: string }) {
  return (
    <div className="py-6">
      <div className="t-eyebrow text-mute mb-2">No matches</div>
      <p className="t-body text-graphite">
        Nothing matched <span className="text-ink font-medium">{q}</span>. Try a single word
        like &ldquo;pants&rdquo; or &ldquo;starter&rdquo;.
      </p>
    </div>
  )
}

function ResultsBody({
  products,
  posts,
  q,
  onSelect,
}: {
  products: Product[]
  posts: ContentPost[]
  q: string
  onSelect: () => void
}) {
  const formatPrice = useFormatPrice()
  return (
    <div className="flex flex-col gap-8">
      {products.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <div className="t-eyebrow text-mute">Products</div>
            <Link
              to={`/shop?q=${encodeURIComponent(q)}`}
              onClick={onSelect}
              className="text-[12px] uppercase tracking-widest font-medium text-ink hover:text-pink-deep inline-flex items-center gap-1"
            >
              See all <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
          <ul className="m-0 p-0 list-none divide-y divide-hairline-soft border-t border-b border-hairline-soft">
            {products.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/shop/${p.slug}`}
                  onClick={onSelect}
                  className="flex items-center gap-4 py-3 no-underline group"
                >
                  <div className="w-14 h-14 shrink-0 bg-blush overflow-hidden">
                    {p.images?.[0]?.url ? (
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt || p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] text-ink font-medium leading-tight group-hover:text-pink-deep transition-colors">
                      {p.name}
                    </div>
                    {p.shortDescription ? (
                      <div className="text-[12px] text-mute truncate mt-0.5">
                        {p.shortDescription}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-[14px] font-medium text-ink whitespace-nowrap">
                    {formatPrice(p.basePriceB2C)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <div className="t-eyebrow text-mute">From the journal</div>
            <Link
              to="/journal"
              onClick={onSelect}
              className="text-[12px] uppercase tracking-widest font-medium text-ink hover:text-pink-deep inline-flex items-center gap-1"
            >
              All articles <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
          <ul className="m-0 p-0 list-none divide-y divide-hairline-soft border-t border-b border-hairline-soft">
            {posts.map((post: ContentPost) => (
              <li key={post._id}>
                <Link
                  to={
                    post.kind === 'education'
                      ? `/education/${post.slug}`
                      : `/journal/${post.slug}`
                  }
                  onClick={onSelect}
                  className="flex items-start gap-4 py-3 no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-widest font-medium text-mute font-mono">
                      {post.kind === 'education' ? 'Education' : 'Journal'} ·{' '}
                      {post.readMinutes} min read
                    </div>
                    <div
                      className={cn(
                        'text-[15px] mt-1 leading-tight font-display italic text-ink',
                        'group-hover:text-pink-deep transition-colors',
                      )}
                    >
                      {post.title}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
