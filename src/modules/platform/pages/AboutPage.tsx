// /about, Our Story editorial composition. Each section owns its own surface tone and padding.

import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Photo } from '@/components/shop/Photo'
import { IconArrowRight } from '@/components/chrome/icons'

import aboutHero from '@/assets/about-mensa.jpg'
import founderPortrait from '@/assets/kenny-1.jpg'
import foundersEnvironmental from '@/assets/kenny-000.jpg'
import productPackOfThree from '@/assets/mensa-pant-5.png'
import myCycooCover from '@/assets/my-cycoo.jpg'
import workshopSewingLine from '@/assets/sum_box.jpg'
import invitationImage from '@/assets/invitation.jpg'

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
            Our story
          </span>
        </div>
        {/* <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-mute">
          Vol · 01 · May 2026
        </span> */}
      </div>

      {/* Centerpiece statement */}
      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(34px,6.3vw,108px)] leading-[0.98] tracking-[-0.03em] text-ink">
          We started with one belief:
          <br />
          <span className="pl-[6%] lg:pl-[10%] block">
            periods should never be <span className="text-pink whitespace-nowrap">a luxury.</span>
          </span>
        </h1>

        {/* Byline */}
        <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
          <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            A letter from the founder,{' '}
            <span className="text-ink font-semibold">Kehinde Abereoje</span>, about the girls she
            met at fourteen whose lives were affected by terrorism, and the solution she has spent
            nearly a decade building.
          </p>
          <a
            href="#origin"
            className="inline-flex items-center gap-2 no-underline text-ink text-[13.5px] font-medium py-2.5 px-4 rounded-full border border-ink"
          >
            Read the letter <ChevronDown size={14} strokeWidth={1.6} />
          </a>
        </div>
      </div>

      {/* Editorial photo with the two brand facts overlaid on the corners */}
      <div className="px-5 md:px-10 lg:px-16 pb-10 lg:pb-16">
        <div className="relative overflow-hidden">
          <Photo
            tone="blush"
            ratio="21/9"
            src={aboutHero}
            alt="Mensa founders and the Kubwa workshop"
          />
          {/* Bottom scrim keeps the paper text readable over any photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/75 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 md:px-8 pb-4 md:pb-6">
            <PhotoFact n="2025" label="Founded" />
            <PhotoFact n="Nationwide" label="Delivery, 2 to 5 days" align="right" />
          </div>
        </div>
      </div>
    </section>
  )
}

function PhotoFact({ n, label, align }: { n: string; label: string; align?: 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="font-display italic font-semibold text-[clamp(22px,3vw,32px)] leading-none text-paper">
        {n}
      </div>
      <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.12em] text-paper/80 uppercase">
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
      b: 'Every woman deserves to manage her period with comfort, confidence and knowledge. We believe dignity begins with having the right products and the right information.',
    },
    {
      n: '02',
      t: 'Sustainable',
      b: 'A better period should not come at the expense of the planet. Our reusable products are designed to reduce waste while lasting for years (meaning more money in your pocket).',
    },
    {
      n: '03',
      t: 'Convenient',
      b: 'Life is busy enough already. Mensa gives you reliable protection that fits seamlessly into work, school, travel and every part of your day.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-blush">
      <div className="max-w-275 mx-auto">
        <SectionEyebrow color="var(--berry)">Our mission</SectionEyebrow>
        <p className="m-0 mt-6 font-display italic font-medium text-[clamp(32px,6vw,80px)] leading-none tracking-tight text-berry">
          To make periods <span className="text-ink">dignified, sustainable and convenient</span>{' '}
          for every woman through the right products and knowledge.
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
        <div>
          <SectionEyebrow>The why</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
            How a visit at fourteen became Mensa.
          </h2>
          <p className="mt-6 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            At 14, Kehinde visited a camp for people who had been affected by terrorism in Northern
            Nigeria. It was the first time she truly understood that her world and theirs were miles
            apart, even though they were in the same city. Girls spoke about missing school because
            they had no period products, and she heard the unsafe alternatives they were forced to
            use instead.
          </p>
          <p className="mt-3.5 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            At 16, she started a nonprofit with one goal: to make menstrual health education and
            period products more accessible to girls across Nigeria. For years, that work reached
            thousands of women and girls, but it also revealed a bigger truth. Charity could help in
            the moment, but it could not guarantee dignity for every girl.
          </p>
          <p className="mt-3.5 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            That is why Mensa was created. We believe good period products should be comfortable,
            sustainable and accessible to all, so no woman has to rely on luck, donations or
            circumstance to manage her period.
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <div>
          <SectionEyebrow>Product design</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-[-0.02em] text-ink">
            Every product is designed with you in mind.
          </h2>
          <p className="mt-6 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.6]">
            At Mensa, we do not just design period products. We create thoughtful tools that make
            periods easier to understand, easier to manage and easier to talk about. From reusable
            period pants and pads to game cards, books and bold advocacy pieces, every product is
            designed with purpose.
          </p>
          {/* The four-layer construction of the reusable period products. */}
          <div className="mt-7 flex flex-col gap-3.5">
            <MStat
              n="01"
              label="Soft inner layer: sits comfortably against your skin and keeps you feeling dry."
            />
            <MStat
              n="02"
              label="Super absorbent core: locks in menstrual flow for hours without feeling bulky."
            />
            <MStat
              n="03"
              label="Leakproof barrier: prevents leaks while remaining breathable and flexible."
            />
            <MStat
              n="04"
              label="Durable outer fabric: washable, reusable and designed to last for years."
            />
          </div>
        </div>
        <Photo
          tone="stripe"
          ratio="auto"
          src={workshopSewingLine}
          alt="The Mensa workshop sewing line in Kubwa"
          className="h-full!"
        />
      </div>
    </section>
  )
}

function MStat({ n, label }: { n: string; label: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4 items-baseline pt-3 border-t border-hairline-soft">
      <span className="font-display italic font-semibold text-[32px] text-coral leading-none whitespace-nowrap">
        {n}
      </span>
      <span className="text-ink text-[15px] leading-normal">{label}</span>
    </div>
  )
}

// ─── FOUNDER ─────────────────────────────────────────────────────
// Single founder layout, tuned for one person rather than a team grid.
function Founders() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-cream">
      <div className="mb-10 lg:mb-12">
        <SectionEyebrow>The founder</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.05] tracking-tight text-ink max-w-200">
          Meet the mind behind Mensa.
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-stretch">
        {/* Portrait */}
        <div className="relative h-full">
          <Photo
            tone="blush"
            ratio="auto"
            src={founderPortrait}
            alt="Kehinde Abereoje, founder of Mensa Period Products"
            className="h-full!"
          />
          {/* <div className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper/95 backdrop-blur-xs text-ink font-mono text-[10.5px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-coral" />
            Founder · Abuja
          </div> */}
        </div>

        {/* Narrative */}
        <div className="flex flex-col gap-7">
          <div>
            <div className="font-mono text-[11px] tracking-widest text-coral uppercase font-medium">
              CEO, Mensa
            </div>
            <h3 className="m-0 mt-3 font-display italic font-semibold text-[clamp(32px,5vw,52px)] leading-[1.02] tracking-tight text-ink">
              Kehinde Abereoje.
            </h3>
          </div>

          <div className="flex flex-col gap-4 text-graphite text-[clamp(15px,1.8vw,17.5px)] leading-[1.65]">
            <p className="m-0">
              Kehinde Abereoje is an award-winning social entrepreneur and public health
              professional who has spent almost a decade working to improve the lives of women and
              girls through menstrual health and gender equality.
            </p>
            <p className="m-0">
              She is building sustainable period care that is accessible, practical and proudly
              African. Kehinde holds a BSc in Public Health from Babcock University, an MPhil in
              Population Health Sciences from the University of Cambridge, and is an MBA candidate
              at the University of Oxford.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── IMPACT ──────────────────────────────────────────────────────
function Impact() {
  const stats: { n: string; label: string }[] = [
    { n: '200+', label: 'Disposable pads replaced by one reusable period pant each year' },
    { n: '4 layers', label: 'Wicking, absorbent core, leakproof membrane, outer shell' },
    { n: '₦40k+', label: 'Saved every year by switching to reusable period products' },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-ink text-paper">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-14">
        <div>
          <SectionEyebrow color="var(--pink)">The impact</SectionEyebrow>
          <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(32px,5vw,72px)] leading-[1.02] tracking-tight text-paper max-w-230">
            One reusable period pant.
            <br />
            One reusable period pad.
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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

// ─── PARTNERSHIPS ────────────────────────────────────────────────
function Partnerships() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-32 bg-paper">
      <div className="mb-10 lg:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <SectionEyebrow>Partnerships</SectionEyebrow>
          <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-[1.02] tracking-tight text-ink">
            Schools, NGOs, Governments.
          </h2>
          <p className="mt-4 max-w-135 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            We are open to partnering with organisations, institutions and individuals who want to
            provide sustainable and dignified period care for girls in their communities. Eligible
            organisations receive discounted pricing on Mensa products.
          </p>
        </div>
        <Button asChild variant="ink" size="lg">
          <Link to="/partnerships">Partner with Mensa</Link>
        </Button>
      </div>
    </section>
  )
}

// ─── FINAL CTA ───────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-14 lg:py-20 bg-blush">
      <div className="relative overflow-hidden min-h-90 lg:min-h-115">
        {/* Background photo */}
        <img
          src={invitationImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {/* Overlay for legibility. Darker on the left where the copy sits,
            fading out to the right so the image still reads through. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/25"
        />

        {/* Content */}
        <div className="relative flex flex-col justify-center gap-5 lg:gap-6 max-w-160 py-12 md:py-16 lg:py-20 px-6 md:px-10 lg:px-14 text-paper">
          <SectionEyebrow color="var(--paper)">The invitation</SectionEyebrow>
          <h2 className="m-0 font-display italic font-semibold text-[clamp(30px,5vw,52px)] leading-[1] tracking-tight text-paper">
            Switch once. Wear for <span className="text-pink">many years.</span>
          </h2>
          <p className="max-w-115 text-[clamp(14.5px,1.6vw,17px)] leading-[1.55] text-paper opacity-90">
            One reusable period pant can replace over 300 disposable pads during its lifetime. One
            pack of five reusable pads can replace more than 1,500 disposable pads over five years.
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            <Button asChild variant="primary" size="lg">
              <Link to="/find-my-starter-set">
                Find my starter set <IconArrowRight size={16} />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="border-paper text-paper hover:bg-paper hover:text-ink!"
            >
              <Link to="/journal">Read the journal</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
