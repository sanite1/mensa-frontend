// ContentArticle: shared single post view for the journal and the education
// library, in the design system's look (blush header band, rounded cover,
// prose body). Each page passes its own copy so the wording stays per page.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Markdown } from '@/components/editorial/Markdown'
import { Photo } from '@/components/shop/Photo'
import { CATEGORY_LABEL, formatPostDate } from '@/components/design/ContentIndex'
import type { ContentPost } from '@/lib/network/types/content.types'

export interface ContentArticleCopy {
  basePath: string
  /** Back link above the headline. */
  backLabel: string
  notFoundBack: string
  notFoundTitle: string
  notFoundBody: ReactNode
  moreLabel: string
  /** Placeholder label when a post has no cover; omit to show no placeholder. */
  placeholderLabel?: string
}

const backClass =
  'inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute) no-underline hover:text-(--ink)'

export function ContentArticle({
  post,
  isLoading,
  copy,
}: {
  post: ContentPost | undefined
  isLoading: boolean
  copy: ContentArticleCopy
}) {
  if (isLoading) {
    return (
      <main className="section section--blush min-h-[60vh]">
        <p className="wrap text-(--mute)">Loading…</p>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="section section--blush min-h-[60vh]">
        <div className="wrap">
          <Link to={copy.basePath} className={backClass}>
            <ArrowLeft size={14} /> {copy.notFoundBack}
          </Link>
          <h1 className="split mt-6 text-(length:--fs-h2)">
            <span className="split-line">
              <span>{copy.notFoundTitle}</span>
            </span>
          </h1>
          <p className="lede mt-4 max-w-130">{copy.notFoundBody}</p>
          <Link className="btn mt-8" to={copy.basePath}>
            {copy.notFoundBack}
          </Link>
        </div>
      </main>
    )
  }

  const category = CATEGORY_LABEL[post.category]

  return (
    <article>
      <header className="section section--blush pb-0!">
        <div className="wrap">
          <Link to={copy.basePath} className={backClass}>
            <ArrowLeft size={14} /> {copy.backLabel}
          </Link>
          <div className="mt-10 max-w-230">
            <span className="eyebrow">
              {category} · {post.readMinutes} min read
            </span>
            <h1 className="split mt-5 text-(length:--fs-h1)">
              <span className="split-line">
                <span>{post.title}</span>
              </span>
            </h1>
            {post.excerpt ? <p className="lede mt-6 max-w-150">{post.excerpt}</p> : null}
            <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-(--line) pt-5 text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
              <span className="text-(--ink)">{post.authorName}</span>
              <span>{formatPostDate(post.publishedAt ?? post.createdAt)}</span>
              {post.eyebrow ? <span>{post.eyebrow}</span> : null}
            </div>
          </div>

          {post.coverImage?.url || copy.placeholderLabel ? (
            <div className="relative mt-[clamp(2.5rem,5vw,4rem)] translate-y-[clamp(2rem,4vw,3.5rem)] overflow-hidden rounded-(--r-lg)">
              {post.coverImage?.url ? (
                <img
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || post.title}
                  // Cover is the LCP element on the post page.
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="aspect-21/9 w-full object-cover"
                />
              ) : (
                <Photo
                  tone="cream"
                  ratio="21/9"
                  priority="eager"
                  label={`${copy.placeholderLabel} · ${category}`}
                />
              )}
            </div>
          ) : (
            <div className="h-[clamp(3rem,6vw,5rem)]" />
          )}
        </div>
      </header>

      <div className="section">
        <div className="wrap">
          <div className="mx-auto max-w-180">
            <Markdown source={post.body ?? ''} />

            <div className="mt-16 border-t border-(--line) pt-8">
              <span className="eyebrow">Written by</span>
              <div className="mt-3 text-(length:--fs-lg) font-medium text-(--ink)">
                {post.authorName}
              </div>
              {post.authorBio ? (
                <p className="mt-1 max-w-130 text-(length:--fs-sm) text-(--mute)">
                  {post.authorBio}
                </p>
              ) : null}
            </div>

            <Link className="btn btn--ghost mt-10" to={copy.basePath}>
              {copy.moreLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
