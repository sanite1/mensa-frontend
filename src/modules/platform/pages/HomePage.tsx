// ═══════════════════════════════════════════════════════════════
// /  — Mensa homepage (editorial composition).
//
// Surface rhythm matches the design board:
//   paper → ink → paper → cream → blush → paper → cream → paper → blush
//
// Sections are intentionally a single long composition (no shared
// "page" wrapper) so each section can own its own horizontal padding,
// background and breathing space. Most product data is hard-coded
// editorial copy — the Shop teaser pulls from the real catalogue via
// useProducts so the four cards always reflect what's actually for sale.
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  IconArrowRight,
  IconLeaf,
  IconShield,
  IconTruck,
  IconUser,
} from '@/components/chrome/icons'
import { Photo } from '@/components/shop/Photo'
import { ShopCard } from '@/components/shop/ShopCard'
import heroImage from '@/assets/kenny-t.jpg'
import foundersEnvironmental from '@/assets/kenny-000.jpg'
import productPackOfThree from '@/assets/mensa-pant-5.png'
import myCycooCover from '@/assets/my-cycoo.jpg'

import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { BigNumber } from '@/components/editorial/BigNumber'
import { TrustStrip } from '@/components/editorial/TrustStrip'

import { useProducts } from '@/lib/network/api/product.api'
import { useFormatPrice } from '@/lib/currency'
import type { Product } from '@/lib/network/types/product.types'
import { useContentList } from '@/lib/network/api/content.api'
import type { ContentPost } from '@/lib/network/types/content.types'
import { useSeo } from '@/lib/seo'

export function HomePage() {
  useSeo({
    title: 'Reusable period products, made in Abuja',
    description:
      'Switch once. Wear for five years. Mensa makes reusable period pants and pads designed for Nigerian women. One pack replaces hundreds of disposables.',
  })
  return (
    <div className="bg-paper">
      <Hero />
      <MicroTrust />
      <Pillars />
      <ShopTeaser />
      <BrandStory />
      <Education />
      <Journal />
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 bg-paper lg:min-h-180">
      <div className="px-5 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 flex flex-col justify-between gap-12 order-2 lg:order-1">
        <div>
          <SectionEyebrow color="var(--coral)">Nigeria's first reusable period pant</SectionEyebrow>
          <h1 className="mt-6 font-display italic font-semibold text-[clamp(48px,8vw,96px)] leading-[0.96] tracking-tight text-ink">
            Switch once.
            <br />
            Wear for <span className="text-pink">five years.</span>
          </h1>
          <p className="mt-6 max-w-120 text-graphite text-[clamp(16px,2vw,19px)] leading-[1.55]">
            Reusable period pants, designed in Abuja and tested for our days. One pack replaces
            hundreds of disposables, and feels better than every one of them.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to="/shop">Shop the starter set</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/about">
                How they work <IconArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hidden on mobile where the MicroTrust marquee below already
            carries the same trust language, and stacked hero copy makes
            this list feel like busywork. */}
        <div className="hidden lg:block">
          <TrustStrip
            items={[
              { text: 'Designed & sewn in Abuja' },
              { text: 'Nationwide delivery, 2 to 5 days' },
              { text: 'Five-year wear · replaces 250+ disposables' },
            ]}
          />
        </div>
      </div>

      <div className="relative min-h-100 lg:min-h-180 order-1 lg:order-2">
        <div className="absolute inset-0">
          <Photo
            tone="blush"
            ratio="auto"
            src={heroImage}
            alt="Mensa reusable period pant in black on a blush pink background"
            className="h-full!"
            priority="eager"
          />
        </div>
      </div>
    </section>
  )
}

// ─── MICRO TRUST ─────────────────────────────────────────────────
function MicroTrust() {
  const items: { icon: React.ReactNode; text: string }[] = [
    { icon: <IconTruck size={18} />, text: 'Nationwide delivery · 2 to 5 days' },
    { icon: <IconShield size={18} />, text: '30 day comfort guarantee' },
    { icon: <IconLeaf size={18} />, text: '5 year lifetime, zero monthly cost' },
    { icon: <IconUser size={18} />, text: 'Designed & sewn in Abuja' },
  ]
  // Mobile/tablet: infinite marquee — the track renders two identical
  // copies of the list back-to-back, and a `translateX(-50%)` animation
  // scrolls the second copy in exactly as the first scrolls out.
  // Desktop (lg+): the original static four-across grid.
  const doubled = [...items, ...items]
  return (
    <section className="bg-ink text-paper py-5 overflow-hidden">
      {/* Marquee — mobile and tablet only */}
      <div className="flex w-max animate-marquee gap-10 pl-5 md:pl-10 lg:hidden">
        {doubled.map((it, i) => (
          <div
            key={i}
            aria-hidden={i >= items.length}
            className="flex items-center gap-3 text-[13.5px] text-paper/90 whitespace-nowrap shrink-0"
          >
            <span className="text-pink">{it.icon}</span>
            <span>{it.text}</span>
          </div>
        ))}
      </div>

      {/* Static grid — desktop only */}
      <div className="hidden lg:grid px-16 grid-cols-4 gap-6 items-center">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 text-[13.5px] text-paper/90">
            <span className="text-pink">{it.icon}</span>
            <span>{it.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── PILLARS ─────────────────────────────────────────────────────
function Pillars() {
  const items = [
    {
      n: '01',
      title: 'Leak proof. Lab tested.',
      body: 'Four layer construction holds the equivalent of four regular tampons. No shifting, no liner, no leak, through our heaviest day testing.',
    },
    {
      n: '02',
      title: 'Five year lifetime.',
      body: 'Each pair replaces 250+ disposables. One pack of three is your period sorted for sixty months. The maths is the marketing.',
    },
    {
      n: '03',
      title: 'Made in Abuja.',
      body: 'Designed and sewn here. We answer DMs in hours, ship nationwide in days, and replace anything that does not feel right.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-8 lg:gap-12 mb-12 lg:mb-16">
        <SectionEyebrow>The pillars</SectionEyebrow>
        <h2 className="m-0 max-w-180 font-display italic font-semibold text-[clamp(32px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
          The three things every Mensa customer tells her sister about.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
        {items.map((it) => (
          <div key={it.n} className="flex flex-col gap-4 pt-7 border-t border-hairline">
            <BigNumber>{it.n}</BigNumber>
            <h3 className="m-0 font-display italic font-semibold text-[28px] leading-[1.1] tracking-[-0.015em] text-ink">
              {it.title}
            </h3>
            <p className="m-0 text-graphite text-[16px] leading-[1.55]">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── SHOP TEASER ─────────────────────────────────────────────────
function ShopTeaser() {
  const query = useProducts({ pageSize: 4, sort: 'featured' })
  const products: Product[] = query.data?.data?.items ?? []
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-cream">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8 mb-12 lg:mb-14">
        <div>
          <SectionEyebrow>Shop the range</SectionEyebrow>
          <h2 className="m-0 mt-5 text-ink font-display italic font-semibold text-[clamp(36px,5vw,64px)] leading-none tracking-[-0.02em]">
            Eight products. One promise.
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-[14.5px] font-medium text-ink no-underline self-start lg:self-auto border-b border-ink pb-1"
        >
          View the full range <IconArrowRight size={16} />
        </Link>
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-cream-soft animate-pulse aspect-4/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-[14px] text-mute">
          New pieces dropping soon. <Link to="/shop">Visit the shop</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ShopCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── BRAND STORY ────────────────────────────────────────────────
function BrandStory() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-24 lg:py-32 bg-blush">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
        <div>
          <SectionEyebrow color="var(--berry)">Our story</SectionEyebrow>
          <h2 className="m-0 mt-6 font-display italic font-semibold text-[clamp(40px,6vw,80px)] leading-none tracking-tight text-berry">
            Built in Abuja,
            <br />
            for women like us.
          </h2>
          <p className="mt-8 max-w-135 text-[19px] leading-[1.55] text-berry opacity-85">
            We started Mensa because our mums, our sisters and our friends deserved better than
            scratchy pads and overpriced imports. Reusable period products that fit our climate, our
            wallets and our days. The conversation comes free.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Button asChild variant="ink" size="lg">
              <Link to="/about">Read our story</Link>
            </Button>
            <div className="text-[13px] text-berry opacity-70">
              Designed in Abuja · five years per pair
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
          <Photo
            tone="cream"
            ratio="3/4"
            src={foundersEnvironmental}
            alt="Kehinde Abereoje at the Mensa studio"
          />
          <div className="grid grid-rows-2 gap-3.5">
            <Photo
              tone="blush"
              ratio="1/1"
              src={productPackOfThree}
              alt="Mensa reusable period pants, pack of three"
            />
            <Photo
              tone="ink"
              ratio="1/1"
              src={myCycooCover}
              alt="My Cycoo period education guide cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── EDUCATION ──────────────────────────────────────────────────
function Education() {
  // Alternating card tones so the two cards read as a set even if the
  // catalogue changes what ships in the education category over time.
  const tones: Array<'blush' | 'cream'> = ['blush', 'cream']
  const query = useProducts({ category: 'education', pageSize: 2, sort: 'featured' })
  const products: Product[] = query.data?.data?.items ?? []

  if (products.length === 0) return null

  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="max-w-220 mb-12 lg:mb-16">
        <SectionEyebrow>Education</SectionEyebrow>
        <h2 className="m-0 mt-5 text-ink font-display italic font-semibold text-[clamp(32px,5vw,64px)] leading-none tracking-[-0.02em]">
          We make products. We also make space for the conversation.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {products.map((product, i) => (
          <EduCard key={product.slug ?? product.id} tone={tones[i % tones.length]} product={product} />
        ))}
      </div>
    </section>
  )
}

function EduCard({ tone, product }: { tone: 'blush' | 'cream'; product: Product }) {
  const formatPrice = useFormatPrice()
  const bgClass = tone === 'blush' ? 'bg-blush' : 'bg-cream-soft'
  const image = product.images?.[0]
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-6 lg:gap-7 p-7 ${bgClass}`}>
      <Photo
        tone={tone === 'blush' ? 'blush' : 'cream'}
        ratio="4/5"
        src={image?.url}
        alt={image?.alt ?? product.name}
      />
      <div className="flex flex-col">
        {/* The text block centers itself in the space the tall image
            creates, so short catalogue copy never leaves a dead void
            between the heading and the price row. */}
        <div className="my-auto">
          <div className="font-mono text-[11px] tracking-[0.12em] text-berry uppercase">
            {product.name}
          </div>
          <h3 className="m-0 mt-3.5 font-display italic font-semibold text-[28px] leading-[1.1] tracking-[-0.015em] text-ink">
            {product.subheading || product.shortDescription}
          </h3>
          {product.shortDescription && product.subheading ? (
            <p className="m-0 mt-3.5 text-graphite text-[15px] leading-[1.55]">
              {product.shortDescription}
            </p>
          ) : null}
          {product.description ? (
            <p className="m-0 mt-3.5 text-graphite text-[15px] leading-[1.6] line-clamp-5">
              {product.description}
            </p>
          ) : null}
        </div>
        <div className="pt-6 flex items-baseline justify-between gap-3">
          <span className="text-ink text-[16px] font-medium">
            {formatPrice(product.basePriceB2C)}
          </span>
          <Link
            to={`/shop/${product.slug}`}
            className="inline-flex items-center gap-2 text-ink no-underline text-[14px] font-medium border-b border-ink pb-0.75"
          >
            View product <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── JOURNAL ────────────────────────────────────────────────────
// Reads the three most recent published journal posts straight from
// the CMS. When the editorial team publishes a new post in the admin
// Content tab (kind=journal, status=published) it shows up here on
// the next page load — no code change required.
function Journal() {
  const query = useContentList({ kind: 'journal', pageSize: 3 })
  const articles: ContentPost[] = query.data?.data?.items ?? []
  // Stable placeholder tones per slug so the home page doesn't reshuffle
  // between renders before cover images are uploaded.
  const tones: Array<'stripe' | 'cream' | 'blush'> = ['stripe', 'cream', 'blush']

  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8 mb-12 lg:mb-14">
        <div className="max-w-220">
          <SectionEyebrow>From the journal</SectionEyebrow>
          <h2 className="m-0 mt-5 text-ink font-display italic font-semibold text-[clamp(28px,4vw,56px)] leading-[1.02] tracking-tight">
            Plain spoken writing about periods, products and the people we serve.
          </h2>
        </div>
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-[14.5px] font-medium text-ink no-underline self-start lg:self-auto border-b border-ink pb-1 whitespace-nowrap"
        >
          All articles <IconArrowRight size={16} />
        </Link>
      </div>
      {articles.length === 0 ? (
        <p className="t-body-s text-mute">New articles coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((a: ContentPost, i: number) => (
            <Link
              key={a._id}
              to={`/journal/${a.slug}`}
              className="flex flex-col gap-4 no-underline group"
            >
              {a.coverImage?.url ? (
                <img
                  src={a.coverImage.url}
                  alt={a.coverImage.alt || a.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-3/2 object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <Photo
                  tone={tones[i % tones.length]}
                  ratio="3/2"
                  label={`${a.category.toUpperCase()} · editorial image`}
                />
              )}
              <div className="font-mono text-[11px] tracking-widest text-mute uppercase">
                {a.category} · {a.readMinutes} min read
              </div>
              <h3 className="m-0 font-display italic font-semibold text-[24px] leading-tight tracking-tight text-ink group-hover:text-pink-deep transition-colors">
                {a.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
