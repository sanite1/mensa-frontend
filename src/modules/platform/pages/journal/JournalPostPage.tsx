// /journal/:slug single post. GET /content/:slug 404s for drafts by design.

import { useParams } from 'react-router-dom'

import { useContentPost } from '@/lib/network/api/content.api'
import { useSeo } from '@/lib/seo'
import { ContentArticle } from '@/components/design/ContentArticle'

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
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt || undefined,
          image: post.coverImage?.url ? [post.coverImage.url] : undefined,
          datePublished: post.publishedAt ?? post.createdAt,
          author: { '@type': 'Person', name: post.authorName },
          publisher: {
            '@type': 'Organization',
            name: 'Mensa Period Products',
            logo: { '@type': 'ImageObject', url: 'https://mensaproducts.com/og-image.png' },
          },
          mainEntityOfPage: `https://mensaproducts.com/journal/${post.slug}`,
        }
      : undefined,
  })

  return (
    <ContentArticle
      post={query.isError ? undefined : post}
      isLoading={query.isLoading}
      copy={{
        basePath: '/journal',
        backLabel: 'The journal',
        notFoundBack: 'Back to the journal',
        notFoundTitle: 'We could not find that article.',
        notFoundBody:
          'It might have moved, or never been published. Try our journal index for the latest pieces.',
        moreLabel: 'More from the journal',
      }}
    />
  )
}
