// ═══════════════════════════════════════════════════════════════
// /about — Mensa Our Story (editorial composition).
//
// Eight-section editorial walk-through of the brand, in this order:
//   Hero · Mission · Origin · Manufacturing · Founders · Impact ·
//   Press · Partnerships · FinalCta
//
// Like the homepage this is a single long composition — each section
// owns its own surface tone and horizontal padding for proper rhythm.
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Photo } from '@/components/shop/Photo'
import { IconArrowRight } from '@/components/chrome/icons'

import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { BigNumber } from '@/components/editorial/BigNumber'
import { useSeo } from '@/lib/seo'

export function AboutPage() {
  useSeo({
    title: 'Our story',
    description:
      'Mensa was founded by Kehinde Abereoje in Abuja — a public-health advocate who turned a visit to a displaced persons camp at fourteen into a workshop, a brand, and an answer to period poverty in Nigeria.',
  })
  return (
    <div className="bg-paper">
      <Hero />
      <Mission />
      <Origin />
      <Manufacturing />
      <Founders />
      <Impact />
      <PressStrip />
      <Partnerships />
      <FinalCta />
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="bg-paper">
      {/* Issue band */}
      <div className="px-5 md:px-10 lg:px-16 pt-8 lg:pt-16 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3 text-coral">
          <span aria-hidden className="w-7 h-px bg-current opacity-60" />
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase font-medium">
            Our story · Wuse II, Abuja
          </span>
        </div>
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-mute">
          Vol · 01 · May 2026
        </span>
      </div>

      {/* Centerpiece statement */}
      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(40px,9.3vw,168px)] leading-[0.92] tracking-[-0.03em] text-ink">
          We started with
          <br />
          <span className="pl-[6%] lg:pl-[8%] block">one sewing</span>
          <span className="pl-[14%] lg:pl-[20%] block">machine, and</span>a{' '}
          <span className="text-pink">question.</span>
        </h1>

        {/* Byline */}
        <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
          <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            A letter from <span className="text-ink font-semibold">Kehinde Abereoje</span>,
            founder, about the girls in displaced communities she first met at fourteen, and
            the small workshop she built to do something about it.
          </p>
          <a
            href="#origin"
            className="inline-flex items-center gap-2 no-underline text-ink text-[13.5px] font-medium py-2.5 px-4 rounded-full border border-ink"
          >
            Read the letter <ChevronDown size={14} strokeWidth={1.6} />
          </a>
        </div>
      </div>

      {/* Editorial photo */}
      <div className="px-5 md:px-10 lg:px-16 pb-10 lg:pb-16">
        <div className="relative overflow-hidden">
          <Photo
            tone="blush"
            ratio="21/9"
            label="HERO · founders & workshop"
            sublabel="warm tones, indoor studio"
          />
          <div className="absolute left-4.5 top-4 flex items-center gap-2.5 px-3 py-2 rounded-sm bg-paper/90 backdrop-blur-[4px] text-ink font-mono text-[10.5px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Plate 01 · Pack of 3 · Onyx Black
          </div>
        </div>

        {/* Facts ticker */}
        <div className="mt-5 lg:mt-7 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 border-t border-hairline">
          <Fact n="2023" label="Founded" />
          <Fact n="12" label="Women on payroll" />
          <Fact n="5,200" label="Customers served" />
          <Fact n="27 / 36" label="Nigerian states reached" />
        </div>
      </div>
    </section>
  )
}

function Fact({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display italic font-semibold text-[28px] leading-none text-ink">{n}</div>
      <div className="mt-1.5 font-mono text-[11px] tracking-[0.12em] text-mute uppercase">
        {label}
      </div>
    </div>
  )
}

// ─── MISSION ─────────────────────────────────────────────────────
function Mission() {
  const pillars = [
    {
      n: '01',
      t: 'Dignified',
      b: "Plain language. Comfortable fit. Products that fit our climate, not someone else's.",
    },
    {
      n: '02',
      t: 'Sustainable',
      b: 'Each pair replaces 250+ disposables over its five-year life. Better for you, your wallet, the planet.',
    },
    {
      n: '03',
      t: 'Convenient',
      b: 'Designed and shipped from Abuja. Two day delivery to most cities. Replacements without receipts.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-blush">
      <div className="max-w-275 mx-auto">
        <SectionEyebrow color="var(--berry)">Our mission</SectionEyebrow>
        <p className="m-0 mt-6 font-display italic font-medium text-[clamp(32px,6vw,80px)] leading-none tracking-tight text-berry">
          To make periods <span className="text-ink">dignified, sustainable and convenient</span>{' '}
          for every Nigerian woman, and to normalise the conversation while we are at it.
        </p>
        <div className="mt-10 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((p) => (
            <div key={p.n} className="pt-5 border-t border-[rgba(139,31,53,0.25)]">
              <BigNumber color="var(--berry)" size={48}>
                {p.n}
              </BigNumber>
              <h3 className="m-0 mt-3 font-display italic font-semibold text-[22px] text-berry">
                {p.t}
              </h3>
              <p className="m-0 mt-2 text-[14.5px] leading-[1.55] text-berry opacity-80">{p.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ORIGIN ──────────────────────────────────────────────────────
function Origin() {
  return (
    <section id="origin" className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-20 items-center">
        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
          <Photo
            tone="cream"
            ratio="3/4"
            label="FOUNDERS · environmental portrait"
            sublabel="warm light, indoor studio"
          />
          <div className="grid grid-rows-2 gap-3.5">
            <Photo tone="blush" ratio="1/1" label="PRODUCT · pack of 3" />
            <Photo tone="ink" ratio="1/1" label="MY CYCOO · guide cover" />
          </div>
        </div>
        <div>
          <SectionEyebrow>The why</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
            How a visit at fourteen became Mensa.
          </h2>
          <p className="mt-6 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            Kehinde was fourteen when she first visited an internally displaced persons camp near
            her home in Abuja. The thing that stayed with her was small and unsexy: girls were
            missing school, every month, because they had no period products. The maths was
            grim. One pack of disposable pads costs more than a day's food.
          </p>
          <p className="mt-3.5 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            At sixteen she co-founded Purple Pact with her twin brother. The Initiative has
            since reached more than ten thousand women and girls across Nigeria. Mensa is the
            answer to a question Purple Pact kept running into: how do you actually solve period
            poverty when single-use pads cost what they cost? You make a product that lasts five
            years.
          </p>
          <blockquote className="mt-8 py-5 px-6 bg-cream-soft border-l-[3px] border-coral font-display italic font-medium text-[clamp(18px,2.5vw,24px)] leading-[1.3] text-ink">
            "We wanted to tackle some of the little things that have the biggest consequences."
            <footer className="mt-3 text-[13px] font-sans not-italic font-medium text-graphite">
              Kehinde Abereoje, founder
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

// ─── MANUFACTURING ───────────────────────────────────────────────
function Manufacturing() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-10 lg:gap-16 items-start">
        <div>
          <SectionEyebrow>Manufacturing</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
            Sewn here.
            <br />
            By women, paid well.
          </h2>
          <p className="mt-6 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            Every Mensa pant is cut, sewn and packed in our Wuse II workshop. Twelve seamstresses,
            paid above the FCT garment trade rate, work a single shift across a five day week. No
            overnight runs, no overtime quotas, no rebadged imports.
          </p>
          <div className="mt-7 flex flex-col gap-3.5">
            <MStat n="12" label="Seamstresses on payroll" />
            <MStat n="36k+" label="Pants sewn since launch" />
            <MStat n="100%" label="Materials sourced in Nigeria and the UAE" />
            <MStat n="0" label="Sweatshop hours, ever" />
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-3.5 lg:min-h-175">
          <div className="row-span-2">
            <Photo
              tone="stripe"
              ratio="3/4"
              label="WORKSHOP · sewing line"
              sublabel="natural window light"
              className="h-full!"
            />
          </div>
          <Photo tone="cream" ratio="4/3" label="DETAIL · gusset stitching" />
          <Photo tone="blush" ratio="4/3" label="PRODUCT · pack of 3" />
        </div>
      </div>
    </section>
  )
}

function MStat({ n, label }: { n: string; label: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 items-baseline pt-3 border-t border-hairline-soft">
      <span className="font-display italic font-semibold text-[32px] text-coral leading-none">
        {n}
      </span>
      <span className="text-ink text-[15px] leading-normal">{label}</span>
    </div>
  )
}

// ─── FOUNDERS ────────────────────────────────────────────────────
// ─── FOUNDER ─────────────────────────────────────────────────────
// Single founder editorial layout: large environmental portrait on the
// left, eyebrow + name + role + narrative + a row of stat tiles + a
// pull-quote on the right. Tuned for one person rather than a team grid.
function Founders() {
  const milestones: { n: string; label: string }[] = [
    { n: '14', label: 'Years old at the IDP camp that started it all' },
    { n: '10K+', label: 'Women and girls reached through Purple Pact' },
    { n: '2024', label: 'Diana Award recipient · gender equality' },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-cream">
      <div className="mb-10 lg:mb-12">
        <SectionEyebrow>The founder</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.05] tracking-tight text-ink max-w-200">
          One founder. One workshop in Abuja. One question that would not let her go.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
        {/* Portrait */}
        <div className="relative">
          <Photo
            tone="blush"
            ratio="4/5"
            label="PORTRAIT · KEHINDE ABEREOJE"
            sublabel="natural light, founder at the studio"
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/95 backdrop-blur-[4px] text-ink font-mono text-[10.5px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Founder · Abuja
          </div>
        </div>

        {/* Narrative */}
        <div className="flex flex-col gap-7">
          <div>
            <div className="font-mono text-[11px] tracking-widest text-coral uppercase font-medium">
              Founder · CEO · Public-health advocate
            </div>
            <h3 className="m-0 mt-3 font-display italic font-semibold text-[clamp(32px,5vw,52px)] leading-[1.02] tracking-tight text-ink">
              Kehinde Abereoje.
            </h3>
          </div>

          <div className="flex flex-col gap-4 text-graphite text-[clamp(15px,1.8vw,17.5px)] leading-[1.65]">
            <p className="m-0">
              Kehinde grew up in Abuja and started Purple Pact Initiative with her twin brother
              at sixteen, after a visit to an internally displaced persons camp put a number on
              what girls actually lose to period poverty: school days, dignity, options.
            </p>
            <p className="m-0">
              Purple Pact has since reached more than ten thousand women and girls across
              Nigeria. Mensa is the for-profit arm that funds the work, the answer to a question
              that kept coming up in the field: cheaper pads do not exist. Better pads do.
            </p>
            <p className="m-0">
              Kehinde holds a BSc in Public Health from Babcock University and an MPhil in
              Population Health Sciences from the University of Cambridge, where she was a
              Mastercard Foundation Scholar. She received the Diana Award in 2024 for her work
              on gender equality.
            </p>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4 mt-2">
            {milestones.map((m) => (
              <div
                key={m.label}
                className="border-t border-hairline pt-4 flex flex-col gap-1.5"
              >
                <BigNumber color="var(--berry)" size={36}>
                  {m.n}
                </BigNumber>
                <p className="m-0 text-[12px] leading-snug text-graphite">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Pull quote */}
          <blockquote className="m-0 mt-4 py-5 px-6 bg-paper border-l-[3px] border-coral font-display italic font-medium text-[clamp(17px,2.2vw,22px)] leading-[1.35] text-ink">
            "People shouldn't have to fight for, and receive a pat on the back for, fighting for
            gender equality. It's something that's just meant to happen."
            <footer className="mt-3 text-[12px] font-sans not-italic font-medium text-mute uppercase tracking-widest">
              Kehinde, on the Diana Award
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

// ─── IMPACT ──────────────────────────────────────────────────────
// Per-product math instead of unverifiable adoption numbers — these
// are facts about how the product itself is built, not customer
// counts. Once we have real shipping data and consented partner
// rosters, swap in those numbers and pull a quarterly-update note.
function Impact() {
  const stats: { n: string; label: string }[] = [
    { n: '5 yrs', label: 'Useful life of one pair, washed every cycle' },
    { n: '250+', label: 'Disposable pads one pair replaces over five years' },
    { n: '4 layers', label: 'Wicking, absorbent core, leakproof membrane, outer shell' },
    { n: '100%', label: 'Designed, cut and sewn in our Wuse II studio' },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-ink text-paper">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-14">
        <div>
          <SectionEyebrow color="var(--pink)">The product, in plain numbers</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(32px,6vw,80px)] leading-none tracking-tight text-paper">
            The marketing is
            <br />
            the maths.
          </h2>
        </div>
        <div className="max-w-80 text-paper/65 text-[14px] leading-[1.55]">
          Facts about how each pair is built. When we have real shipping numbers worth
          publishing, this is where we will publish them.
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((s, i) => (
          <div key={s.label} className="pt-5 lg:pt-7 border-t border-paper/20">
            <span
              className={cn(
                'block font-display italic font-semibold text-[clamp(40px,5vw,72px)] leading-[0.95] tracking-tight',
                i === 0 ? 'text-pink' : 'text-paper',
              )}
            >
              {s.n}
            </span>
            <div className="mt-3 text-paper/75 text-[14px] leading-normal">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── PRESS STRIP ─────────────────────────────────────────────────
function PressStrip() {
  // Press masthead styling: each outlet renders in its native typographic
  // tone. We restrict to two fonts (display vs sans) and two italic / weight
  // variants, so a small map of Tailwind class strings covers every case.
  const press: { name: string; classes: string }[] = [
    { name: 'TechCabal', classes: 'font-display italic font-bold' },
    { name: 'Pulse Nigeria', classes: 'font-sans font-bold' },
    { name: 'BellaNaija', classes: 'font-display font-semibold' },
    { name: 'Stears', classes: 'font-sans font-semibold' },
    { name: 'Big Cabal', classes: 'font-display italic font-semibold' },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-12 lg:py-16 bg-cream-soft border-y border-hairline">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="font-mono text-[11px] tracking-[0.12em] text-mute uppercase font-medium">
          As seen in
        </div>
        <div className="flex items-center flex-wrap gap-7 lg:gap-12 opacity-85">
          {press.map((p) => (
            <span
              key={p.name}
              className={cn('text-[clamp(16px,2vw,22px)] text-ink tracking-[-0.015em]', p.classes)}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
      <blockquote className="m-0 mt-7 lg:mt-10 max-w-230 font-display italic font-medium text-[clamp(20px,3vw,32px)] leading-[1.3] text-ink tracking-[-0.012em]">
        "The Abuja D2C brand quietly building Nigeria's most considered period care product."
        <footer className="mt-2.5 text-[12px] font-sans font-medium text-mute not-italic tracking-[0.08em] uppercase">
          TechCabal · February 2025
        </footer>
      </blockquote>
    </section>
  )
}

// ─── PARTNERSHIPS ────────────────────────────────────────────────
// Pre-launch, so no real partner roster to name. We describe what each
// tier of partnership offers and point readers at /partnerships to
// apply. Swap in named partners + counts once they are real and have
// consented to being credited.
function Partnerships() {
  const blocks: { kind: string; offer: string; copy: string }[] = [
    {
      kind: 'Schools',
      offer: 'Educator kits, in-class sessions',
      copy: 'Bulk per student. Educator kits and a forty-minute classroom session included, with a payment plan that fits a term.',
    },
    {
      kind: 'NGOs',
      offer: 'Programme pricing',
      copy: 'Distribution drives at cost-friendly rates. Volume rebates against measurable reach.',
    },
    {
      kind: 'Councils',
      offer: 'Net 30 on verified POs',
      copy: 'Net 30 terms for verified council orders. Multi-tranche fulfilment across LGAs.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="mb-10 lg:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <SectionEyebrow>Partnerships</SectionEyebrow>
          <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-tight text-ink">
            Schools, NGOs, councils.
          </h2>
          <p className="mt-4 max-w-135 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            We sell direct to women, and we partner with organisations who want every girl in
            their care to have reusable period products from her first cycle. Programmes are
            opening up now — applications are reviewed within five working days.
          </p>
        </div>
        <Button asChild variant="ink" size="lg">
          <Link to="/partnerships">Partner with Mensa</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((p) => (
          <div key={p.kind} className="bg-cream-soft p-6 flex flex-col gap-3 h-full">
            <div className="font-mono text-[10.5px] tracking-widest uppercase text-mute font-medium">
              {p.kind}
            </div>
            <div className="font-display italic font-semibold text-[22px] leading-tight tracking-tight text-ink">
              {p.offer}
            </div>
            <p className="m-0 t-body-s text-graphite leading-relaxed">{p.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── FINAL CTA ───────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-blush">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-20 items-center">
        <div>
          <SectionEyebrow color="var(--berry)">The invitation</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(40px,8vw,96px)] leading-[0.96] tracking-tight text-berry">
            Switch once.
            <br />
            Wear for <span className="text-ink">five years.</span>
          </h2>
          <p className="mt-6 max-w-135 text-[clamp(15px,2vw,19px)] leading-[1.55] text-berry opacity-85">
            One pack of three pants replaces 250 disposables and lasts you sixty months. Start with
            the Starter Set and let us know what you think, we read every review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="ink" size="lg">
              <Link to="/shop">
                Shop the starter set <IconArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/journal">Read the journal</Link>
            </Button>
          </div>
        </div>
        <Photo
          tone="blush"
          ratio="4/5"
          label="FINAL · pack of 3"
          sublabel="warm tones, soft light"
        />
      </div>
    </section>
  )
}
