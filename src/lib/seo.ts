// seo.ts — per page meta tag updates at runtime.
// Vite SPA without SSR, so social crawlers that skip JS only ever see index.html defaults.

import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
  /** Absolute or root-relative URL for OG/Twitter image. */
  image?: string
  /** Defaults to 'website'. Use 'article' for journal/education posts. */
  type?: 'website' | 'article' | 'product'
  /** Bypass the " · Mensa Period Products" suffix on the document title. */
  titleAsIs?: boolean
  /** Skip indexing for this page (used on auth / account / admin pages). */
  noindex?: boolean
}

const BRAND_SUFFIX = ' · Mensa Period Products'
const DEFAULT_IMAGE = '/mensa-logo.png'

/** Get or create a `<meta>` tag matching the given attribute. */
function setMeta(attr: 'name' | 'property', key: string, value: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/** Get or create the canonical link. */
function setCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSeo(opts: SeoOptions): void {
  const {
    title,
    description,
    image,
    type = 'website',
    titleAsIs = false,
    noindex = false,
  } = opts

  useEffect(() => {
    const fullTitle = titleAsIs ? title : `${title}${BRAND_SUFFIX}`
    const fullImage = image ?? DEFAULT_IMAGE
    const canonicalUrl = window.location.origin + window.location.pathname

    // Snapshot previous values so we restore them on unmount — keeps
    // the back navigation feeling correct.
    const prevTitle = document.title
    document.title = fullTitle

    setMeta('property', 'og:title', fullTitle)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', fullImage)
    setMeta('name', 'twitter:image', fullImage)

    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }

    if (noindex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      // Default crawl. Explicit so we override any prior noindex left over
      // from an earlier (auth) page in the same SPA session.
      setMeta('name', 'robots', 'index, follow')
    }

    setCanonical(canonicalUrl)

    return () => {
      document.title = prevTitle
    }
  }, [title, description, image, type, titleAsIs, noindex])
}
