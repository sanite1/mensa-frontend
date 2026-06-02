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

import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { BigNumber } from '@/components/editorial/BigNumber'
import { TrustStrip } from '@/components/editorial/TrustStrip'

import { useProducts } from '@/lib/network/api/product.api'
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

        <TrustStrip
          items={[
            { text: 'Designed & sewn in Abuja' },
            { text: 'Free delivery in Abuja & Lagos' },
            { text: 'Five-year wear · replaces 250+ disposables' },
          ]}
        />
      </div>

      <div className="relative min-h-100 lg:min-h-180 order-1 lg:order-2">
        <div className="absolute inset-0">
          <Photo
            tone="blush"
            ratio="auto"
            label="HERO · pack of three"
            sublabel="warm tones, soft light"
            className="h-full!"
            // priority="eager"
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
  return (
    <section className="px-5 md:px-10 lg:px-16 py-5 bg-ink text-paper">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 items-center">
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
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <Photo
            tone="stripe"
            ratio="3/4"
            label="FOUNDER · environmental portrait"
            sublabel="warm tones, soft light"
          />
          <div className="grid grid-rows-2 gap-4">
            <Photo tone="ink" ratio="1/1" label="DETAIL · stitching" />
            <Photo tone="cream" ratio="1/1" label="STUDIO · sewing room" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── EDUCATION ──────────────────────────────────────────────────
function Education() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="max-w-220 mb-12 lg:mb-16">
        <SectionEyebrow>Education</SectionEyebrow>
        <h2 className="m-0 mt-5 text-ink font-display italic font-semibold text-[clamp(32px,5vw,64px)] leading-none tracking-[-0.02em]">
          We make products. We also make space for the conversation.
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <EduCard
          tone="blush"
          eyebrow="THE FLOW GAME · EDUCATORS EDITION"
          title="Period conversations that do not feel like a lecture."
          body="Fifty cards across four categories: Guess It, Say It, This or That, True or False. Built for classrooms, girls' nights and that one tricky workshop you've been putting off."
          price="₦10,000"
        />
        <EduCard
          tone="cream"
          eyebrow="MY CYCOO · GUIDE TO MENSTRUAL HYGIENE"
          title="A 60-page guide for every first period, and every one after."
          body="Written with educators in Abuja. Plain language, pretty illustrations, zero euphemisms. The book we wish we'd had at ten."
          price="₦7,500"
        />
      </div>
    </section>
  )
}

interface EduCardProps {
  tone: 'blush' | 'cream'
  eyebrow: string
  title: string
  body: string
  price: string
}

function EduCard({ tone, eyebrow, title, body, price }: EduCardProps) {
  // Tone class lookup keeps the card Tailwind-only.
  const bgClass = tone === 'blush' ? 'bg-blush' : 'bg-cream-soft'
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] gap-6 lg:gap-7 p-7 ${bgClass}`}>
      <Photo
        tone={tone === 'blush' ? 'blush' : 'cream'}
        ratio="4/5"
        label="PRODUCT · editorial still"
      />
      <div className="flex flex-col">
        <div className="font-mono text-[11px] tracking-[0.12em] text-berry uppercase">
          {eyebrow}
        </div>
        <h3 className="m-0 mt-3.5 font-display italic font-semibold text-[28px] leading-[1.1] tracking-[-0.015em] text-ink">
          {title}
        </h3>
        <p className="m-0 mt-3.5 text-graphite text-[15px] leading-[1.55]">{body}</p>
        <div className="mt-auto pt-6 flex items-baseline justify-between gap-3">
          <span className="text-ink text-[16px] font-medium">{price}</span>
          <Link
            to="/shop"
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
        <div>
          <SectionEyebrow>From the journal</SectionEyebrow>
          <h2 className="m-0 mt-5 text-ink font-display italic font-semibold text-[clamp(28px,4vw,56px)] leading-[1.02] tracking-tight">
            Plain spoken writing about periods, products and the people we serve.
          </h2>
        </div>
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-[14.5px] font-medium text-ink no-underline self-start lg:self-auto border-b border-ink pb-1"
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
