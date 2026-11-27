// Catch-all 404 page. Client-side render, so the HTTP status is still 200.

import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowLeft } from 'lucide-react'

import { useSeo } from '@/lib/seo'

interface SuggestionLink {
  label: string
  href: string
  hint: string
}

const SUGGESTIONS: SuggestionLink[] = [
  { label: 'Shop', href: '/shop', hint: 'Pants, pads, the starter set.' },
  { label: 'Track an order', href: '/orders/track', hint: 'Lookup with order number + email.' },
  { label: 'Journal', href: '/journal', hint: 'Stories from our studio.' },
  { label: 'Contact us', href: '/contact', hint: 'A real human will reply.' },
]

export function NotFoundPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Tag the title with the bad path and noindex so Google doesn't
  // catalogue this URL.
  useSeo({
    title: `Not found · ${location.pathname}`,
    titleAsIs: true,
    noindex: true,
  })

  return (
    <>
      <header className="fhero">
        <div className="wrap fhero__inner">
          <div>
            <span className="eyebrow">404 · Page not found</span>
            <h1 className="split">
              <span className="split-line">
                <span>404.</span>
              </span>
              <span className="split-line">
                <span className="accent" style={{ '--d': '.1s' } as CSSProperties}>
                  Nothing here.
                </span>
              </span>
            </h1>
            <p className="mt-4 max-w-60 truncate text-(length:--fs-xs) font-medium uppercase tracking-[0.12em] text-(--mute)">
              {location.pathname}
            </p>
          </div>
          <div className="grid max-w-110 gap-6">
            <p className="lede max-w-none!">
              The page you were looking for has moved, never existed, or has a typo in the URL. Try
              one of the routes below, or head back home.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link className="btn" to="/">
                Back home
              </Link>
              <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>
                <ArrowLeft size={14} />
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Try one of these</span>
          <h2 className="mt-4 text-(length:--fs-h3) tracking-tight">The main routes on Mensa.</h2>
          <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 lg:grid-cols-4">
            {SUGGESTIONS.map((s) => (
              <li key={s.href} data-reveal>
                <Link
                  to={s.href}
                  className="ptn-card block h-full no-underline transition-transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-(length:--fs-lg) font-medium text-(--ink)">{s.label}</h3>
                  <p className="mt-2 text-(length:--fs-sm) text-(--mute)">{s.hint}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
