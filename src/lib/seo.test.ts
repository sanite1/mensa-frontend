import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSeo } from './seo'

function metaContent(attr: 'name' | 'property', key: string): string | null {
  return document.head
    .querySelector(`meta[${attr}="${key}"]`)
    ?.getAttribute('content') ?? null
}

beforeEach(() => {
  document.head.innerHTML = ''
  document.title = ''
})

describe('useSeo', () => {
  it('sets document.title with the brand suffix', () => {
    renderHook(() => useSeo({ title: 'Shop' }))
    expect(document.title).toBe('Shop · Mensa Period Products')
  })

  it('honours titleAsIs to skip the suffix', () => {
    renderHook(() =>
      useSeo({ title: 'Not found · /missing', titleAsIs: true }),
    )
    expect(document.title).toBe('Not found · /missing')
  })

  it('writes description into both meta description and OG description', () => {
    renderHook(() =>
      useSeo({ title: 'Shop', description: 'Reusable period products.' }),
    )
    expect(metaContent('name', 'description')).toBe('Reusable period products.')
    expect(metaContent('property', 'og:description')).toBe(
      'Reusable period products.',
    )
    expect(metaContent('name', 'twitter:description')).toBe(
      'Reusable period products.',
    )
  })

  it('writes og:type — defaults to website, switches to article when asked', () => {
    const { rerender } = renderHook(
      ({ type }: { type?: 'website' | 'article' | 'product' }) =>
        useSeo({ title: 'A', type }),
      { initialProps: {} },
    )
    expect(metaContent('property', 'og:type')).toBe('website')

    rerender({ type: 'article' })
    expect(metaContent('property', 'og:type')).toBe('article')
  })

  it('sets robots=noindex when requested, defaults to index, follow', () => {
    const { rerender } = renderHook(
      ({ noindex }: { noindex?: boolean }) =>
        useSeo({ title: 'X', noindex }),
      { initialProps: { noindex: true } },
    )
    expect(metaContent('name', 'robots')).toBe('noindex, nofollow')

    rerender({ noindex: false })
    expect(metaContent('name', 'robots')).toBe('index, follow')
  })

  it('falls back to the default image, absolutized, when none is given', () => {
    renderHook(() => useSeo({ title: 'X' }))
    const expected = `${window.location.origin}/og-image.png`
    expect(metaContent('property', 'og:image')).toBe(expected)
    expect(metaContent('name', 'twitter:image')).toBe(expected)
  })

  it('uses a provided image when given', () => {
    renderHook(() =>
      useSeo({ title: 'X', image: 'https://cdn.example.com/x.jpg' }),
    )
    expect(metaContent('property', 'og:image')).toBe('https://cdn.example.com/x.jpg')
  })
})
