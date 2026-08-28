// /journal listing. GET /content?kind=journal returns published posts only.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { Photo } from '@/components/shop/Photo'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { useContentList } from '@/lib/network/api/content.api'
import type {
  ContentCategory,
  ContentPost,
} from '@/lib/network/types/content.types'
import { cn } from '@/lib/utils'
import { useSeo } from '@/lib/seo'

const CATEGORY_LABEL: Record<ContentCategory, string> = {
  classroom: 'Classroom',
  product: 'Product',
  community: 'Community',
  policy: 'Policy',
  care: 'Care',
}

// Deterministic placeholder tone per slug so a post keeps the same tile across reloads.
const PLACEHOLDER_TONES = ['stripe', 'cream', 'blush', 'ink'] as const
type PlaceholderTone = (typeof PLACEHOLDER_TONES)[number]
function toneForSlug(slug: string): PlaceholderTone {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  }
  return PLACEHOLDER_TONES[hash % PLACEHOLDER_TONES.length]
}

const PAGE_SIZE = 24

export function JournalIndexPage() {
  useSeo({
    title: 'The journal',
    description:
      'Plain spoken writing about periods, products, and the people we serve. Field notes, product teardowns, and community stories from the Mensa team.',
  })
  const [category, setCategory] = useState<ContentCategory | 'all'>('all')
  // `q` is the live input, `debouncedQ` feeds the query key so we don't fire a request per keystroke.
  const [q, setQ] = useState('')
  const debouncedQ = useDebounced(q, 250)

  const params = useMemo(
    () => ({
      kind: 'journal' as const,
      category: category === 'all' ? undefined : category,
      q: debouncedQ.trim() || undefined,
      pageSize: PAGE_SIZE,
    }),
    [category, debouncedQ],
  )

  const query = useContentList(params)
  const posts: ContentPost[] = query.data?.data?.items ?? []
  const isSearching = debouncedQ.trim().length > 0
  // Hide the feature treatment while filtering or searching, it would overweight the first match.
  const showFeature = !isSearching && category === 'all'
  const [feature, ...rest] = posts

  // Only offer category chips that match something in the current result set.
  const visibleCategories = useMemo(() => {
    const set = new Set<ContentCategory>()
    for (const p of posts) set.add(p.category)
    return Array.from(set)
  }, [posts])

  return (
    <div className="bg-paper">
      {/* Hero strip */}
      <section className="bg-paper">
        <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
          <SectionEyebrow color="var(--berry)">From the journal</SectionEyebrow>
          <h1 className="mt-6 font-display italic font-semibold text-[clamp(40px,7vw,112px)] leading-[0.95] tracking-tighter text-ink">
            Honest conversations.
            <br />
            <span className="pl-[6%] lg:pl-[8%] block">Practical tips. Better periods.</span>
            <span className="pl-[14%] lg:pl-[18%] block">
              For the girlies. <span className="text-pink">By the girlies.</span>
            </span>
          </h1>
          <p className="mt-8 max-w-165 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            The Journal is where we share menstrual health tips, reusable product guides, stories
            from our community, advocacy tips, partnership lessons, and the latest news from
            Mensa. Everything is written to be helpful, relatable and easy to understand.
          </p>
        </div>
      </section>

      {/* Toolbar: search + category chips */}
      <section className="px-5 md:px-10 lg:px-16 pb-6 border-t border-hairline">
        <div className="pt-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          {/* Search input */}
          <div className="relative flex-1 min-w-0 lg:max-w-105">
            <Search
              size={16}
              strokeWidth={1.6}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute pointer-events-none"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the journal…"
              aria-label="Search the journal"
              className="h-11 w-full pl-10 pr-10 border border-hairline bg-paper text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            ) : null}
          </div>

          {/* Category chips (only when there's more than one category live) */}
          {visibleCategories.length > 1 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip
                active={category === 'all'}
                onClick={() => setCategory('all')}
              >
                All
              </FilterChip>
              {visibleCategories.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {CATEGORY_LABEL[c]}
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>

        {/* Result summary while searching — confirms what we matched */}
        {isSearching && !query.isLoading ? (
          <div className="mt-4 text-[12px] uppercase tracking-widest font-medium text-mute font-mono">
            {posts.length === 0
              ? `No matches for "${debouncedQ}"`
              : `${posts.length} match${posts.length === 1 ? '' : 'es'} for "${debouncedQ}"`}
          </div>
        ) : null}
      </section>

      {/* Body */}
      <section className="px-5 md:px-10 lg:px-16 pb-24 lg:pb-32 pt-4 lg:pt-8 bg-paper">
        {query.isLoading ? (
          <p className="t-body-s text-mute">Loading…</p>
        ) : posts.length === 0 ? (
          <EmptyState
            mode={
              isSearching ? 'searched' : category !== 'all' ? 'filtered' : 'empty'
            }
            query={debouncedQ}
            onReset={() => {
              setQ('')
              setCategory('all')
            }}
          />
        ) : showFeature ? (
          <>
            {feature ? <FeatureCard post={feature} /> : null}
            {rest.length > 0 ? (
              <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {rest.map((p: ContentPost) => (
                  <ArticleCard key={p._id} post={p} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          // Searched / category-filtered: flat grid (no feature card).
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {posts.map((p: ContentPost) => (
              <ArticleCard key={p._id} post={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Components ──────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 text-[12px] uppercase tracking-widest font-medium border rounded-full transition-colors',
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper text-graphite border-hairline hover:border-graphite',
      )}
    >
      {children}
    </button>
  )
}

function FeatureCard({ post }: { post: ContentPost }) {
  return (
    <Link
      to={`/journal/${post.slug}`}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center no-underline group"
    >
      <div className="overflow-hidden">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            // Feature card is the LCP element on the journal index.
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full aspect-4/3 object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <Photo
            tone={toneForSlug(post.slug)}
            priority="eager"
            ratio="4/3"
            label={`FEATURE · ${CATEGORY_LABEL[post.category]}`}
          />
        )}
      </div>
      <div>
        <div className="font-mono text-[11px] tracking-widest text-mute uppercase">
          {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
          {post.eyebrow ? ` · ${post.eyebrow}` : ''}
        </div>
        <h2 className="m-0 mt-4 font-display italic font-semibold text-[clamp(28px,4vw,56px)] leading-[1.05] tracking-tight text-ink">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-5 t-body-l text-graphite max-w-150">{post.excerpt}</p>
        ) : null}
        <div className="mt-6 text-[13px] text-mute uppercase tracking-widest font-medium font-mono">
          {post.authorName} · {formatPostDate(post.publishedAt ?? post.createdAt)}
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ post }: { post: ContentPost }) {
  return (
    <Link to={`/journal/${post.slug}`} className="flex flex-col gap-4 no-underline group">
      <div className="overflow-hidden">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            loading="lazy"
            decoding="async"
            className="w-full aspect-3/2 object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <Photo
            tone={toneForSlug(post.slug)}
            ratio="3/2"
            label={`${CATEGORY_LABEL[post.category]} · editorial image`}
          />
        )}
      </div>
      <div className="font-mono text-[11px] tracking-widest text-mute uppercase">
        {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
      </div>
      <h3 className="m-0 font-display italic font-semibold text-[22px] leading-[1.15] tracking-tight text-ink group-hover:text-pink-deep transition-colors">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="m-0 t-body-s text-graphite line-clamp-3">{post.excerpt}</p>
      ) : null}
      <div className="text-[12px] text-mute uppercase tracking-widest font-medium font-mono mt-auto">
        {post.authorName} · {formatPostDate(post.publishedAt ?? post.createdAt)}
      </div>
    </Link>
  )
}

function EmptyState({
  mode,
  query,
  onReset,
}: {
  mode: 'searched' | 'filtered' | 'empty'
  query: string
  onReset: () => void
}) {
  const headline =
    mode === 'searched'
      ? `No journal posts match "${query}".`
      : mode === 'filtered'
        ? 'Nothing in this category yet.'
        : 'The journal is just getting started.'
  const body =
    mode === 'searched'
      ? 'Try a different word, or browse everything by clearing the search.'
      : mode === 'filtered'
        ? 'Pick another category, or read everything in All.'
        : 'We are writing the first pieces now. Check back soon, or subscribe via our footer to get them as they land.'

  return (
    <div className="border border-hairline-soft bg-cream-soft p-10 lg:p-16 text-center">
      <SectionEyebrow color="var(--mute)">
        {mode === 'empty' ? 'Coming soon' : 'No matches'}
      </SectionEyebrow>
      <h2 className="m-0 mt-4 font-display italic font-semibold text-[clamp(24px,3vw,36px)] leading-tight tracking-tight text-ink">
        {headline}
      </h2>
      <p className="mt-3 max-w-130 mx-auto t-body text-graphite">{body}</p>
      {mode !== 'empty' ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink underline underline-offset-4 hover:text-pink-deep"
        >
          Clear search and filters
        </button>
      ) : null}
    </div>
  )
}

/** Returns `value` after it has stayed unchanged for `delayMs`. Stops
 *  the journal search from firing a request per keystroke without
 *  pulling in a debounce library for one input. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

function formatPostDate(iso: string): string {
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
