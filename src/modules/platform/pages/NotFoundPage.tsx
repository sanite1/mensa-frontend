// Catch-all 404 page. Client-side render, so the HTTP status is still 200.

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
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
    <div className="bg-paper">
      <section className="bg-paper">
        <div className="px-5 md:px-10 lg:px-16 pt-10 lg:pt-16 pb-3 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 text-coral">
            <span aria-hidden className="w-7 h-px bg-current opacity-60" />
            <span className="font-mono text-[11px] tracking-widest uppercase font-medium">
              404 · Page not found
            </span>
          </div>
          <span className="font-mono text-[10.5px] tracking-widest uppercase text-mute truncate max-w-60">
            {location.pathname}
          </span>
        </div>

        <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
          <h1 className="m-0 font-display italic font-semibold text-[clamp(48px,12vw,200px)] leading-[0.92] tracking-tighter text-ink">
            404.
            <br />
            <span className="pl-[6%] lg:pl-[8%] block">
              <span className="text-pink">Nothing here.</span>
            </span>
          </h1>

          <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
            <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
              The page you were looking for has moved, never existed, or has a typo in the URL.
              Try one of the routes below, or head back home.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="lg">
                <Link to="/">Back home</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={14} />
                Go back
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-cream">
        <SectionEyebrow>Try one of these</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(24px,4vw,40px)] leading-tight tracking-tight text-ink">
          The main routes on Mensa.
        </h2>
        <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 list-none m-0 p-0">
          {SUGGESTIONS.map((s) => (
            <li key={s.href}>
              <Link
                to={s.href}
                className="block bg-paper p-5 no-underline border border-transparent hover:border-ink transition-colors h-full"
              >
                <div className="font-display italic font-semibold text-[22px] text-ink leading-tight">
                  {s.label}
                </div>
                <p className="m-0 mt-2 t-body-s text-graphite">{s.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
