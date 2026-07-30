// /returns policy page. No returns on hygiene items, exceptions reported within 3 days by email.

import { Link } from 'react-router-dom'
import { ShieldOff, Camera, Mail, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionEyebrow } from '@/components/editorial/SectionEyebrow'
import { useSeo } from '@/lib/seo'

export function ReturnsPage() {
  useSeo({
    title: 'Returns policy',
    description:
      'For hygiene reasons we do not accept returns or exchanges on period products. Wrong, damaged, or wrong-size items reported within three days of delivery, we make right.',
  })
  return (
    <div className="bg-paper">
      <Hero />
      <Policy />
      <Exception />
      <HowToReport />
      <Closing />
    </div>
  )
}

// ─── HERO ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="bg-paper">
      <div className="px-5 md:px-10 lg:px-16 pt-10 lg:pt-16 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3 text-coral">
          <span aria-hidden className="w-7 h-px bg-current opacity-60" />
          <span className="font-mono text-[11px] tracking-widest uppercase font-medium">
            Returns and exchanges
          </span>
        </div>
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-mute">
          All sales final
        </span>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10 lg:py-16">
        <h1 className="m-0 font-display italic font-semibold text-[clamp(40px,8vw,128px)] leading-[0.95] tracking-tighter text-ink">
          The honest
          <br />
          <span className="pl-[6%] lg:pl-[8%] block">
            <span className="text-pink">returns policy.</span>
          </span>
        </h1>

        <div className="mt-8 lg:mt-12 pt-5 flex flex-wrap items-baseline justify-between gap-5 border-t border-hairline">
          <p className="m-0 max-w-140 text-graphite text-[clamp(15px,2vw,18px)] leading-[1.55]">
            Period products are personal and intimate, so the rules are different from most online
            shopping. Here is exactly how Mensa handles returns, exchanges, and the rare time
            something arrives not quite right.
          </p>
          <a
            href="#exception"
            className="inline-flex items-center gap-2 no-underline text-ink text-[13.5px] font-medium py-2.5 px-4 rounded-full border border-ink"
          >
            Report an issue
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── POLICY (lead) ───────────────────────────────────────────────
function Policy() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-cream">
      <div className="max-w-200 mx-auto">
        <SectionEyebrow>The rule</SectionEyebrow>
        <h2 className="m-0 mt-4 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          No returns or exchanges on period products.
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-paper text-coral shrink-0">
            <ShieldOff size={22} strokeWidth={1.6} />
          </div>
          <p className="m-0 t-body-l text-graphite leading-relaxed max-w-150">
            For hygiene and safety reasons, we do not accept returns or exchanges on period
            products, including our reusable period pants.{' '}
            <span className="text-ink font-medium">All sales are final.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── EXCEPTION ───────────────────────────────────────────────────
function Exception() {
  return (
    <section id="exception" className="px-5 md:px-10 lg:px-16 py-20 lg:py-28 bg-paper">
      <div className="max-w-200 mx-auto">
        <SectionEyebrow color="var(--berry)">The exception</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-ink">
          If something is wrong, we fix it.
        </h2>
        <p className="mt-5 max-w-150 t-body-l text-graphite leading-relaxed">
          If you receive the wrong item, the wrong size, or your product arrives damaged, please
          contact us within{' '}
          <span className="text-ink font-medium">three days of delivery</span>. We will review
          your case and offer a replacement where appropriate.
        </p>

        {/* Inline emphasis card */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Pill label="01 · Wrong item">
            We sent the pads instead of the pants, or the wrong colour landed in your bag.
          </Pill>
          <Pill label="02 · Wrong size">
            The size on the label does not match what you ordered.
          </Pill>
          <Pill label="03 · Damaged in transit">
            Visible tears, stains, or packaging failure that affected the product.
          </Pill>
        </div>

        <p className="mt-8 t-body-s text-mute leading-relaxed max-w-150">
          Three-day window starts on the day your courier marks the order as delivered, or the
          day our in-house rider hands it to you. We treat it generously, so reach out even if
          you are a day late.
        </p>
      </div>
    </section>
  )
}

function Pill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream-soft border border-hairline-soft p-5 flex flex-col gap-2">
      <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
        {label}
      </div>
      <p className="m-0 t-body-s text-graphite leading-relaxed">{children}</p>
    </div>
  )
}

// ─── HOW TO REPORT ───────────────────────────────────────────────
function HowToReport() {
  const items = [
    {
      icon: Mail,
      title: 'Email us',
      body: 'hi@mensaproducts.com — drop us a note within three days of delivery.',
    },
    {
      icon: Sparkles,
      title: 'Include your order number',
      body: 'It looks like MS-2026-00001 and is in your confirmation email.',
    },
    {
      icon: Camera,
      title: 'Attach a clear photo',
      body: 'A single photo of the item showing the issue, plus a short note on what is wrong, is usually enough.',
    },
  ]
  return (
    <section className="px-5 md:px-10 lg:px-16 py-16 lg:py-24 bg-blush">
      <div className="max-w-200 mx-auto">
        <SectionEyebrow color="var(--berry)">How to report</SectionEyebrow>
        <h2 className="m-0 mt-3.5 font-display italic font-semibold text-[clamp(28px,5vw,56px)] leading-tight tracking-tight text-berry">
          Three things, one email.
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it, i) => {
            const Icon = it.icon
            return (
              <div key={it.title} className="bg-paper p-6 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <Icon size={22} strokeWidth={1.6} className="text-pink-deep" />
                  <span className="font-mono text-[11px] tracking-widest uppercase text-mute">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="m-0 font-display italic font-semibold text-[22px] text-ink leading-tight">
                  {it.title}
                </h3>
                <p className="m-0 t-body text-graphite leading-relaxed">{it.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link to="/contact?topic=order">Report an issue</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href="mailto:hi@mensaproducts.com">Email directly</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── CLOSING ────────────────────────────────────────────────────
function Closing() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-20 lg:py-28 bg-ink text-paper">
      <div className="max-w-200 mx-auto text-center">
        <SectionEyebrow color="var(--pink)">Our promise</SectionEyebrow>
        <h2 className="m-0 mt-5 font-display italic font-semibold text-[clamp(32px,6vw,88px)] leading-[0.95] tracking-tighter">
          Mensa products are made to last.
        </h2>
        <p className="mt-6 max-w-130 mx-auto text-paper/80 text-[clamp(15px,2vw,18px)] leading-relaxed">
          If something is not right, we will make it right.
        </p>
        <div className="mt-10 inline-flex flex-wrap items-center gap-4 justify-center">
          <Button asChild variant="primary" size="lg">
            <Link to="/contact?topic=order">Contact our team</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="text-paper hover:bg-white/10">
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
