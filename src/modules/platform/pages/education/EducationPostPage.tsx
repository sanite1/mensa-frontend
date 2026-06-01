// ═══════════════════════════════════════════════════════════════
// /education/:slug — single education guide.
//
// Same data backend as the journal post page, framed as a guide
// rather than an essay. Uses the shared Markdown renderer.
// ═══════════════════════════════════════════════════════════════

import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Photo } from '@/components/shop/Photo'
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

export function EducationPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const query = useContentPost(slug)
  const post = query.data?.data?.post

  useSeo({
    title: post?.title ?? 'Education guide',
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
          to="/education"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Back to the library
        </Link>
        <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,44px)] leading-tight tracking-tight text-ink">
          We could not find that guide.
        </h1>
        <p className="mt-3 max-w-130 t-body text-graphite">
          It might have moved, or never been published. Try the education library for the latest
          guides.
        </p>
        <div className="mt-6">
          <Button asChild variant="primary" size="md">
            <Link to="/education">Back to the library</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="bg-paper">
      <div className="px-5 md:px-10 lg:px-16 pt-10 lg:pt-16">
        <Link
          to="/education"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep"
        >
          <ArrowLeft size={14} /> The library
        </Link>
      </div>

      <header className="px-5 md:px-10 lg:px-16 pt-8 pb-10 lg:pb-14">
        <SectionEyebrow color="var(--berry)">
          {CATEGORY_LABEL[post.category]} · {post.readMinutes} min read
        </SectionEyebrow>
        <h1 className="mt-6 font-display italic font-semibold text-[clamp(36px,6vw,88px)] leading-[0.95] tracking-tight text-ink max-w-260">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-6 t-body-l text-graphite max-w-150">{post.excerpt}</p>
        ) : null}
        <div className="mt-8 pt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-hairline text-[13px] text-mute font-mono uppercase tracking-widest">
          <span className="text-ink not-italic">{post.authorName}</span>
          <span>{formatPostDate(post.publishedAt ?? post.createdAt)}</span>
          {post.eyebrow ? <span>{post.eyebrow}</span> : null}
        </div>
      </header>

      <div className="px-5 md:px-10 lg:px-16">
        {post.coverImage?.url ? (
          <img
            src={post.coverImage.url}
            alt={post.coverImage.alt || post.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full aspect-21/9 object-cover"
          />
        ) : (
          <Photo
            tone="cream"
            ratio="21/9"
            priority="eager"
            label={`GUIDE · ${CATEGORY_LABEL[post.category]}`}
          />
        )}
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-12 lg:py-20">
        <div className="max-w-180 mx-auto">
          <Markdown source={post.body ?? ''} />

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
              <Link to="/education">More from the library</Link>
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
