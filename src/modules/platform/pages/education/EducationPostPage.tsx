// /education/:slug single guide, same backend as the journal post page.

import { useParams } from 'react-router-dom'

import { useContentPost } from '@/lib/network/api/content.api'
import { useSeo } from '@/lib/seo'
import { ContentArticle } from '@/components/design/ContentArticle'

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

  return (
    <ContentArticle
      post={query.isError ? undefined : post}
      isLoading={query.isLoading}
      copy={{
        basePath: '/education',
        backLabel: 'The library',
        notFoundBack: 'Back to the library',
        notFoundTitle: 'We could not find that guide.',
        notFoundBody:
          'It might have moved, or never been published. Try the education library for the latest guides.',
        moreLabel: 'More from the library',
        placeholderLabel: 'GUIDE',
      }}
    />
  )
}
