// Homepage editorial composition, sections own their own padding and surface tone.
// Copy is hard coded except the Shop teaser, which pulls live catalogue via useProducts.

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
import heroImage from '@/assets/hero.jpg'
import foundersEnvironmental from '@/assets/kenny-000.jpg'
import productPackOfThree from '@/assets/mensa-pant-5.png'
import myCycooCover from '@/assets/my-cycoo.jpg'

import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { BigNumber } from '@/components/editorial/BigNumber'

import { useProducts } from '@/lib/network/api/product.api'
import { useFormatPrice } from '@/lib/currency'
import type { Product } from '@/lib/network/types/product.types'
import { useSeo } from '@/lib/seo'

export function HomePage() {
  useSeo({
    title: 'Your one-stop menstrual health shop',
    description:
      'Better periods start here. Reusable period pants and pads, fun menstrual health education, and fashionable advocacy that puts women and girls first.',
  })
  return (
    <div className="bg-paper">
      <Hero />
      <MicroTrust />
      <Pillars />
      <ShopTeaser />
      <BrandStory />
      <Education />
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 bg-paper lg:min-h-180">
      <div className="px-5 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 flex flex-col justify-between gap-12 order-2 lg:order-1">
        <div>
          <SectionEyebrow color="var(--coral)">Periods, but more convenient</SectionEyebrow>
          <h1 className="mt-6 font-display italic font-semibold text-[clamp(44px,7vw,88px)] leading-[0.96] tracking-tight text-ink">
            Your one-stop <span className="text-pink">menstrual health</span> shop.
          </h1>
          <p className="mt-6 max-w-130 text-graphite text-[clamp(16px,2vw,19px)] leading-[1.55]">
            Better periods start here. Discover thoughtfully designed reusable products, fun
            menstrual health education, and fashionable advocacy that puts women and girls first.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link to="/find-my-starter-set">Find my starter set</Link>
            </Button>
            {/* TODO: point at the "how reusables work" journal post once it is published. */}
            <Button asChild variant="ghost" size="lg">
              <Link to="/journal">
                How they work <IconArrowRight size={16} />
              </Link>
            </Button>
          </div>
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
    { icon: <IconUser size={18} />, text: 'Puts women and girls first' },
  ]
  // Mobile marquee needs two copies of the list, translateX(-50%) loops them seamlessly. Desktop is a static grid.
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
      title: 'More convenient.',
      body: "Your day is already busy enough. You shouldn't have to worry about getting stained while you're at work, in school, travelling, sleeping, or simply living your life. Mensa gives you reliable protection, so your period becomes one less thing to think about.",
    },
    {
      n: '02',
      title: 'More cost-effective.',
      body: "Buying disposable pads every month is beginning to look like an expensive subscription. Mensa's reusable period products are designed to last for years, helping you save money while reducing the amount of plastic waste you throw away.",
    },
    {
      n: '03',
      title: 'More modern.',
      body: 'Periods deserve more than outdated products and awkward conversations. Mensa combines chic reusable period care, fun and relatable menstrual health education, and bold, stylish advocacy that lets you wear the conversation with confidence.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-8 lg:gap-12 mb-12 lg:mb-16">
        <SectionEyebrow>The whys</SectionEyebrow>
        <h2 className="m-0 max-w-180 font-display italic font-semibold text-[clamp(32px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
          Three reasons to switch to Mensa for all things periods.
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
            Shop Mensa products. Take one or take all.
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
          <h2 className="m-0 mt-6 font-display italic font-semibold text-[clamp(32px,4.5vw,60px)] leading-[1.05] tracking-tight text-berry">
            We believe managing your period with knowledge and dignity is a human right.
          </h2>
          <div className="mt-8 max-w-135 flex flex-col gap-4 text-[17px] leading-[1.6] text-berry opacity-85">
            <p className="m-0">
              At 16, Kehinde realised that too many girls could not afford pads and knew very little
              about their periods. She believed that something as natural as menstruation should
              never determine a girl's confidence, education, or opportunities. So she started
              supporting girls through her nonprofit, one conversation and one community at a time.
            </p>
            <p className="m-0">
              A decade later, she realised that charity alone could never solve period poverty.
              Every girl deserves access to products that are comfortable, sustainable, and made for
              everyday life, not only when she is rich or fortunate enough to meet an NGO or receive
              a donation.
            </p>
            <p className="m-0">
              That's why Mensa was created: to make better period care accessible, make
              conversations around periods fun, and give women products they can genuinely love
              using.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Button asChild variant="ink" size="lg">
              <Link to="/about">Read our story</Link>
            </Button>
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
          <EduCard
            key={product.slug ?? product.id}
            tone={tones[i % tones.length]}
            product={product}
          />
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
        {/* my-auto centers short catalogue copy in the space the tall image creates. */}
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
