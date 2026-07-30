// ═══════════════════════════════════════════════════════════════
// /journal/:slug — single journal post.
//
// Fetches GET /content/:slug. The backend only returns published
// posts on this surface — draft slugs 404 here, which is exactly
// what we want (drafts live behind the admin CMS only).
// ═══════════════════════════════════════════════════════════════

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { Markdown } from '@/components/editorial/Markdown'
import { useContentPost } from '@/lib/network/api/content.api'
import type { ContentCategory } from '@/lib/network/types/content.types'
import { useSeo } from '@/lib/seo'

const CATEGORY_LABEL: Record<ContentCategory, string> = {
  classroom: 'Classroom',
  product: 'Product',
  community: 'Community',
  policy: 'Policy',
  care: 'Care',
}

export function JournalPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const query = useContentPost(slug)
  const post = query.data?.data?.post

  // Title falls back to the brand default while loading / on error.
  useSeo({
    title: post?.title ?? 'Journal',
    description: post?.excerpt,
    image: post?.coverImage?.url,
    type: post ? 'article' : 'website',
  })

  if (query.isLoading) {
    return (
      <div className="px-5 md:px-10 lg:px-16 py-12 t-body-s text-mute">Loading…</div>
    )
  }

  if (query.isError || !post) {
    return (
      <div className="px-5 md:px-10 lg:px-16 py-12 lg:py-20">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Back to the journal
        </Link>
        <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,44px)] leading-tight tracking-tight text-ink">
          We could not find that article.
        </h1>
        <p className="mt-3 max-w-130 t-body text-graphite">
          It might have moved, or never been published. Try our journal index for the latest
          pieces.
        </p>
        <div className="mt-6">
          <Button asChild variant="primary" size="md">
            <Link to="/journal">Back to the journal</Link>
          </Button>
        </div>
      </div>
    )
  }

  const hasCover = !!post.coverImage?.url

  return (
    <article className="bg-paper">
      {/* Hero — headline overlaid on the cover image so the header and
          cover read as one editorial plate instead of two stacked
          sections. Falls back to a blush surface when no cover exists. */}
      <header className={`relative overflow-hidden ${hasCover ? '' : 'bg-blush'}`}>
        {hasCover ? (
          <>
            <img
              src={post.coverImage!.url}
              alt={post.coverImage!.alt || post.title}
              // Cover is the LCP element on the post page.
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Bottom-heavy scrim keeps the overlaid headline legible
                without flattening the whole photo. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20"
            />
          </>
        ) : null}

        <div className="relative flex flex-col min-h-115 lg:min-h-150 px-5 md:px-10 lg:px-16 pt-10 lg:pt-14 pb-10 lg:pb-14">
          <Link
            to="/journal"
            className={`inline-flex items-center gap-2 self-start text-[12px] uppercase tracking-widest font-medium no-underline ${
              hasCover ? 'text-paper/90 hover:text-paper' : 'text-ink hover:text-pink-deep'
            }`}
          >
            <ArrowLeft size={14} /> The journal
          </Link>

          <div className="mt-auto pt-12">
            <SectionEyebrow color={hasCover ? 'var(--pink)' : 'var(--berry)'}>
              {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
            </SectionEyebrow>
            <h1
              className={`mt-5 font-display italic font-semibold text-[clamp(34px,5.5vw,76px)] leading-[0.98] tracking-tight max-w-230 ${
                hasCover ? 'text-paper' : 'text-ink'
              }`}
            >
              {post.title}
            </h1>
            {post.excerpt ? (
              <p
                className={`mt-5 t-body-l max-w-150 ${
                  hasCover ? 'text-paper/90' : 'text-graphite'
                }`}
              >
                {post.excerpt}
              </p>
            ) : null}
            <div
              className={`mt-7 pt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t text-[13px] font-mono uppercase tracking-widest ${
                hasCover ? 'border-paper/25 text-paper/75' : 'border-hairline text-mute'
              }`}
            >
              <span className={hasCover ? 'text-paper' : 'text-ink'}>{post.authorName}</span>
              <span>{formatPostDate(post.publishedAt ?? post.createdAt)}</span>
              {post.eyebrow ? <span>{post.eyebrow}</span> : null}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="px-5 md:px-10 lg:px-16 py-12 lg:py-20">
        <div className="max-w-180 mx-auto">
          <Markdown source={post.body ?? ''} />

          {/* Author footer */}
          <div className="mt-16 lg:mt-20 pt-8 border-t border-hairline">
            <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
              Written by
            </div>
            <div className="mt-2 text-[18px] font-medium text-ink">{post.authorName}</div>
            {post.authorBio ? (
              <p className="mt-1 t-body-s text-graphite max-w-130">{post.authorBio}</p>
            ) : null}
          </div>

          <div className="mt-10">
            <Button asChild variant="secondary" size="md">
              <Link to="/journal">More from the journal</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
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
