// ContentIndex: shared listing for the journal and the education library, in
// the design system's shop look (blush hero, sticky pill bar, card grid).
// Each page passes its own copy, so the wording stays per page.
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'

import { Photo } from '@/components/shop/Photo'
import { useContentList } from '@/lib/network/api/content.api'
import type { ContentCategory, ContentKind, ContentPost } from '@/lib/network/types/content.types'
import { cn } from '@/lib/utils'

export const CATEGORY_LABEL: Record<ContentCategory, string> = {
  classroom: 'Classroom',
  product: 'Product',
  community: 'Community',
  policy: 'Policy',
  care: 'Care',
}

type PlaceholderTone = 'stripe' | 'cream' | 'blush' | 'ink'

export interface ContentIndexCopy {
  /** Small line above the eyebrow (optional). */
  kicker?: (count: number) => ReactNode
  eyebrow: string
  /** Each entry is one rising line of the heading. */
  titleLines: ReactNode[]
  lede: ReactNode
  searchPlaceholder: string
  searchLabel: string
  featureLabel: string
  emptySearched: (q: string) => string
  emptyAll: string
  emptyAllBody: string
}

const PAGE_SIZE = 24

export function ContentIndex({
  kind,
  basePath,
  tones,
  copy,
}: {
  kind: ContentKind
  basePath: string
  tones: readonly PlaceholderTone[]
  copy: ContentIndexCopy
}) {
  const [category, setCategory] = useState<ContentCategory | 'all'>('all')
  // `q` is the live input, `debouncedQ` feeds the query key so we don't fire a request per keystroke.
  const [q, setQ] = useState('')
  const debouncedQ = useDebounced(q, 250)

  const params = useMemo(
    () => ({
      kind,
      category: category === 'all' ? undefined : category,
      q: debouncedQ.trim() || undefined,
      pageSize: PAGE_SIZE,
    }),
    [kind, category, debouncedQ],
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

  const tone = (slug: string) => tones[hash(slug) % tones.length]

  return (
    <div className="shop">
      <header className="shop-hero pb-[clamp(3rem,6vw,5rem)]">
        <div className="wrap shop-hero__inner">
          <div>
            {copy.kicker ? (
              <p className="mb-4 text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--berry)">
                {copy.kicker(posts.length)}
              </p>
            ) : null}
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 className="split">
              {copy.titleLines.map((line, i) => (
                <span key={i} className="split-line">
                  <span style={{ '--d': `${i * 0.1}s` } as CSSProperties}>{line}</span>
                </span>
              ))}
            </h1>
          </div>
          <p className="lede">{copy.lede}</p>
        </div>
      </header>

      <div className="shop-bar">
        <div className="wrap shop-bar__inner">
          {visibleCategories.length > 1 ? (
            <nav className="shop-cats" aria-label="Categories">
              <button
                type="button"
                className={category === 'all' ? 'is-active' : ''}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {visibleCategories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={category === c ? 'is-active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </nav>
          ) : (
            <span />
          )}
          <div className="relative w-full min-w-0 sm:max-w-80">
            <Search
              size={16}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--mute)"
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchLabel}
              className="h-11 w-full rounded-full bg-(--white) pl-11 pr-10 text-(length:--fs-sm) text-(--ink) shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-(--mute) focus:shadow-[inset_0_0_0_1px_var(--ink)]"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-(--mute) hover:text-(--ink)"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <section className="wrap shop-grid-wrap">
        {isSearching && !query.isLoading ? (
          <p className="mb-6 text-(length:--fs-sm) text-(--mute)">
            {posts.length === 0
              ? `No matches for "${debouncedQ}"`
              : `${posts.length} match${posts.length === 1 ? '' : 'es'} for "${debouncedQ}"`}
          </p>
        ) : null}

        {query.isLoading ? (
          <p className="text-(--mute)">Loading…</p>
        ) : posts.length === 0 ? (
          <EmptyState
            mode={isSearching ? 'searched' : category !== 'all' ? 'filtered' : 'empty'}
            query={debouncedQ}
            copy={copy}
            onReset={() => {
              setQ('')
              setCategory('all')
            }}
          />
        ) : showFeature && feature ? (
          <>
            <FeatureCard
              post={feature}
              href={`${basePath}/${feature.slug}`}
              tone={tone(feature.slug)}
              label={copy.featureLabel}
            />
            {rest.length > 0 ? (
              <div className="shop-grid mt-[clamp(3rem,6vw,5rem)]">
                {rest.map((p) => (
                  <ArticleCard
                    key={p._id}
                    post={p}
                    href={`${basePath}/${p.slug}`}
                    tone={tone(p.slug)}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="shop-grid">
            {posts.map((p) => (
              <ArticleCard
                key={p._id}
                post={p}
                href={`${basePath}/${p.slug}`}
                tone={tone(p.slug)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Meta({ children }: { children: ReactNode }) {
  return (
    <div className="text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
      {children}
    </div>
  )
}

function FeatureCard({
  post,
  href,
  tone,
  label,
}: {
  post: ContentPost
  href: string
  tone: PlaceholderTone
  label: string
}) {
  return (
    <Link
      to={href}
      className="group grid items-center gap-8 no-underline lg:grid-cols-2 lg:gap-12"
      data-reveal
    >
      <div className="overflow-hidden rounded-(--r-lg)">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            // Feature card is the LCP element on the index.
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="aspect-4/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <Photo
            tone={tone}
            priority="eager"
            ratio="4/3"
            label={`${label} · ${CATEGORY_LABEL[post.category]}`}
          />
        )}
      </div>
      <div>
        <Meta>
          {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
          {post.eyebrow ? ` · ${post.eyebrow}` : ''}
        </Meta>
        <h2 className="mt-4 text-(length:--fs-h2) tracking-tight text-(--ink) transition-colors group-hover:text-(--berry)">
          {post.title}
        </h2>
        {post.excerpt ? <p className="lede mt-5 max-w-150">{post.excerpt}</p> : null}
        <div className="mt-6">
          <Meta>
            {post.authorName} · {formatPostDate(post.publishedAt ?? post.createdAt)}
          </Meta>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({
  post,
  href,
  tone,
}: {
  post: ContentPost
  href: string
  tone: PlaceholderTone
}) {
  return (
    <Link to={href} className="group flex flex-col gap-4 no-underline" data-reveal>
      <div className="overflow-hidden rounded-(--r-md)">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            loading="lazy"
            decoding="async"
            className="aspect-3/2 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <Photo
            tone={tone}
            ratio="3/2"
            label={`${CATEGORY_LABEL[post.category]} · editorial image`}
          />
        )}
      </div>
      <Meta>
        {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
      </Meta>
      <h3 className="text-(length:--fs-lg) font-medium tracking-tight text-(--ink) transition-colors group-hover:text-(--berry)">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="line-clamp-3 text-(length:--fs-sm) text-(--mute)">{post.excerpt}</p>
      ) : null}
      <div className="mt-auto">
        <Meta>
          {post.authorName} · {formatPostDate(post.publishedAt ?? post.createdAt)}
        </Meta>
      </div>
    </Link>
  )
}

function EmptyState({
  mode,
  query,
  copy,
  onReset,
}: {
  mode: 'searched' | 'filtered' | 'empty'
  query: string
  copy: ContentIndexCopy
  onReset: () => void
}) {
  const headline =
    mode === 'searched'
      ? copy.emptySearched(query)
      : mode === 'filtered'
        ? 'Nothing in this category yet.'
        : copy.emptyAll
  const body =
    mode === 'searched'
      ? 'Try a different word, or browse everything by clearing the search.'
      : mode === 'filtered'
        ? 'Pick another category, or read everything in All.'
        : copy.emptyAllBody

  return (
    <div className={cn('shop-empty')}>
      <span className="eyebrow">{mode === 'empty' ? 'Coming soon' : 'No matches'}</span>
      <h2>{headline}</h2>
      <p>{body}</p>
      {mode !== 'empty' ? (
        <button type="button" onClick={onReset} className="btn btn--ghost mt-2">
          Clear search and filters
        </button>
      ) : null}
    </div>
  )
}

function hash(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return h
}

/** Returns `value` after it has stayed unchanged for `delayMs`. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export function formatPostDate(iso: string): string {
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
