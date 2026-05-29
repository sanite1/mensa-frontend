// ─────────────────────────────────────────────────────────────────────────
// Footer — single responsive component.
//   ≥ lg : full 5-column layout with big "Periods made convenient." headline
//   md  : 3 columns, condensed headline
//   < md: stacked, accordion columns
// ─────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { MensaLockup } from './MensaWordmark'
import {
  IconPin,
  IconMail,
  IconPhone,
  IconChevronDown,
} from './icons'

const SHOP = ['Period pants', 'Reusable pads', 'The starter set', 'Education', 'Gift cards', 'Shop all']
const LEARN = ['My Cycoo guide', 'FLOW Game', 'Care instructions', 'Size guide', 'Journal', 'FAQ']
const COMPANY = ['Our story', 'Sustainability', 'Partnerships', 'Press', 'Stockists', 'Careers']
const HELP = ['Track order', 'Shipping', 'Returns', 'Contact us', 'Privacy', 'Terms']
const SHOP_LEARN_COMPACT = ['Period pants', 'Reusable pads', 'The starter set', 'FLOW Game', 'My Cycoo', 'Care instructions', 'Size guide']
const COMPANY_HELP_COMPACT = ['Our story', 'Sustainability', 'Partnerships', 'Track order', 'Shipping', 'Returns', 'Contact us']

export function Footer() {
  return (
    <footer className="bg-[var(--ink)] text-[var(--paper)] w-full">
      <DesktopFooter />
      <TabletFooter />
      <MobileFooter />
    </footer>
  )
}

// ─── DESKTOP (≥ lg) ─────────────────────────────────────────────────────
function DesktopFooter() {
  return (
    <div className="hidden lg:block">
      {/* Headline + newsletter */}
      <div
        className="grid items-end border-b border-white/10"
        style={{
          padding: '64px 48px 48px',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 48,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 124,
            lineHeight: 0.9,
            letterSpacing: '-0.035em',
          }}
        >
          Periods
          <br />
          made <span style={{ color: 'var(--pink)' }}>convenient.</span>
        </div>
        <NewsletterColumn fontSize={18} />
      </div>

      {/* Columns */}
      <div
        className="grid"
        style={{
          padding: '48px 48px 36px',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
          gap: 48,
        }}
      >
        <BrandColumn lockupHeight={72} />
        <FootCol title="Shop" items={SHOP} />
        <FootCol title="Learn" items={LEARN} />
        <FootCol title="Company" items={COMPANY} />
        <FootCol title="Help" items={HELP} />
      </div>

      <BottomRow padX={48} />
    </div>
  )
}

// ─── TABLET (md - lg) ───────────────────────────────────────────────────
function TabletFooter() {
  return (
    <div className="hidden md:block lg:hidden">
      <div
        className="grid items-end border-b border-white/10"
        style={{ padding: '48px 40px 36px', gridTemplateColumns: '1fr', gap: 24 }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 64,
            lineHeight: 0.9,
            letterSpacing: '-0.035em',
          }}
        >
          Periods
          <br />
          made <span style={{ color: 'var(--pink)' }}>convenient.</span>
        </div>
        <NewsletterColumn fontSize={15} />
      </div>

      <div
        className="grid"
        style={{
          padding: '40px 40px 32px',
          gridTemplateColumns: '1.6fr 1fr 1fr',
          gap: 32,
        }}
      >
        <BrandColumn lockupHeight={60} />
        <FootCol title="Shop & Learn" items={SHOP_LEARN_COMPACT} />
        <FootCol title="Company & Help" items={COMPANY_HELP_COMPACT} />
      </div>

      <BottomRow padX={40} />
    </div>
  )
}

// ─── MOBILE (< md) ──────────────────────────────────────────────────────
function MobileFooter() {
  return (
    <div className="block md:hidden" style={{ padding: '40px 20px 28px' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 56,
          lineHeight: 0.92,
          letterSpacing: '-0.03em',
          marginBottom: 32,
        }}
      >
        Periods
        <br />
        made <span style={{ color: 'var(--pink)' }}>convenient.</span>
      </div>

      {/* Newsletter */}
      <div className="t-eyebrow mb-3 text-white/55">The newsletter</div>
      <p className="text-[14px] mb-3.5 leading-[1.6] text-white/[0.78]">
        Period care, restocks, the occasional 10% off. Two emails a month, max.
      </p>
      <NewsletterInput mobile />

      <div className="mt-7">
        <Accordion title="Shop" items={['Period pants', 'Reusable pads', 'The starter set', 'Education', 'Gift cards']} />
        <Accordion title="Learn" items={['My Cycoo guide', 'FLOW Game', 'Care instructions', 'Size guide', 'FAQ']} />
        <Accordion title="Company" items={['Our story', 'Sustainability', 'Partnerships', 'Press']} />
        <Accordion title="Help" items={['Track order', 'Shipping', 'Returns', 'Contact us']} />
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2.5 py-6 border-b border-white/[0.12]">
        <FootContact icon={<IconPin size={14} />}>Abuja, FCT, Nigeria</FootContact>
        <FootContact icon={<IconMail size={14} />}>hi@mensaproducts.com</FootContact>
        <FootContact icon={<IconPhone size={14} />}>+234 707 534 5496</FootContact>
      </div>

      <div className="flex gap-2.5 py-[22px]">
        <SocialDotDark label="IG" />
        <SocialDotDark label="TT" />
        <SocialDotDark label="X" />
      </div>

      <div className="t-eyebrow mb-2.5 text-white/55">Pay with</div>
      <div className="flex gap-2 flex-wrap mb-6">
        <PayChip>Paystack</PayChip>
        <PayChip>Nomba</PayChip>
        <PayChip>Bank transfer</PayChip>
      </div>

      <div className="flex flex-col gap-1 text-[12px] text-white/55">
        <div>© 2026 Mensa Period Products</div>
        <div>Designed &amp; made in Nigeria</div>
      </div>
    </div>
  )
}

// ─── Shared bits ────────────────────────────────────────────────────────
function NewsletterColumn({ fontSize }: { fontSize: number }) {
  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="t-eyebrow text-white/55">The newsletter</div>
      <p className="max-w-[380px] text-white" style={{ fontSize, lineHeight: 1.55 }}>
        Period care, restock alerts, the occasional 10% off. Two emails a month, maximum.
      </p>
      <NewsletterInput />
    </div>
  )
}

function NewsletterInput({ mobile = false }: { mobile?: boolean }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex border border-white/30 overflow-hidden"
      style={{ borderRadius: 6, maxWidth: mobile ? '100%' : 420 }}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 bg-transparent border-none text-[var(--paper)] outline-none placeholder:text-white/55"
        style={{
          padding: mobile ? '12px 14px' : '14px 16px',
          fontFamily: 'var(--font-sans)',
          fontSize: mobile ? 14 : 15,
        }}
      />
      <button
        type="submit"
        className="bg-[var(--pink)] text-white border-none cursor-pointer font-sans font-medium hover:bg-[var(--pink-deep)]"
        style={{ padding: mobile ? '0 18px' : '0 22px', fontSize: mobile ? 13 : 14 }}
      >
        Subscribe
      </button>
    </form>
  )
}

function BrandColumn({ lockupHeight }: { lockupHeight: number }) {
  return (
    <div>
      <MensaLockup height={lockupHeight} tone="paper" />
      <p className="text-[14px] mt-[22px] max-w-[280px] leading-[1.6] text-white/70">
        Reusable period products designed in Abuja for Nigerian women. Comfortable. Confident.
        Sustainable.
      </p>
      <div className="flex flex-col gap-2 mt-[22px]">
        <FootContact icon={<IconPin size={14} />}>Abuja, FCT, Nigeria</FootContact>
        <FootContact icon={<IconMail size={14} />}>hi@mensaproducts.com</FootContact>
        <FootContact icon={<IconPhone size={14} />}>+234 707 534 5496</FootContact>
      </div>
    </div>
  )
}

function FootCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="t-eyebrow mb-4 text-white/55">{title}</div>
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item}>
            <Link to="/" className="text-[14px] text-[var(--paper)] no-underline hover:text-[var(--pink)]">
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FootContact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-white/85">
      <span className="text-[var(--pink)]">{icon}</span>
      {children}
    </div>
  )
}

function PayChip({ children }: { children: ReactNode }) {
  return (
    <span
      className="border border-white/20 text-white/85 font-sans"
      style={{
        borderRadius: 4,
        padding: '5px 10px',
        fontSize: 11.5,
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  )
}

function SocialDotDark({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-white/25 text-[var(--paper)] font-sans"
      style={{ width: 32, height: 32, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em' }}
    >
      {label}
    </span>
  )
}

function Accordion({ title, items }: { title: string; items: string[] }) {
  return (
    <details className="border-b border-white/[0.12]">
      <summary
        className="list-none cursor-pointer flex items-center justify-between text-[var(--paper)] font-sans font-medium"
        style={{ padding: '18px 0', fontSize: 15 }}
      >
        {title}
        <IconChevronDown size={16} className="text-[var(--paper)]" />
      </summary>
      <ul className="list-none m-0 pb-[18px] pl-0 pr-0 pt-0 flex flex-col gap-2.5">
        {items.map((i) => (
          <li key={i}>
            <Link to="/" className="text-[14px] text-white/75 no-underline">
              {i}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )
}

function BottomRow({ padX }: { padX: number }) {
  return (
    <div
      className="border-t border-white/10 flex items-center justify-between gap-6 flex-wrap text-white/55"
      style={{ padding: `20px ${padX}px`, fontSize: 12.5 }}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <span>© 2026 Mensa Period Products</span>
        <span className="opacity-50">·</span>
        <span>Designed &amp; made in Nigeria</span>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="mr-2">Pay with</span>
        <PayChip>Paystack</PayChip>
        <PayChip>Nomba</PayChip>
        <PayChip>Bank transfer</PayChip>
      </div>
      <div className="flex gap-2">
        <SocialDotDark label="IG" />
        <SocialDotDark label="TT" />
        <SocialDotDark label="X" />
      </div>
    </div>
  )
}
