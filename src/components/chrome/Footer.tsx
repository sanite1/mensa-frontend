// ─────────────────────────────────────────────────────────────────────────
// Footer — single responsive component.
//   ≥ lg : full 5-column layout with big "Periods made convenient." headline
//   md  : 3 columns, condensed headline
//   < md: stacked, accordion columns
// ─────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { MensaLockup } from './MensaWordmark'
import { IconPin, IconMail, IconPhone, IconChevronDown } from './icons'

const SHOP = [
  'Period pants',
  'Reusable pads',
  'The starter set',
  'Education',
  'Gift cards',
  'Shop all',
]
const LEARN = ['My Cycoo guide', 'FLOW Game', 'Care instructions', 'Size guide', 'Journal', 'FAQ']
const COMPANY = ['Our story', 'Sustainability', 'Partnerships', 'Press', 'Stockists', 'Careers']
const HELP = ['Track order', 'Shipping', 'Returns', 'Contact us', 'Privacy', 'Terms']
const SHOP_LEARN_COMPACT = [
  'Period pants',
  'Reusable pads',
  'The starter set',
  'FLOW Game',
  'My Cycoo',
  'Care instructions',
  'Size guide',
]
const COMPANY_HELP_COMPACT = [
  'Our story',
  'Sustainability',
  'Partnerships',
  'Track order',
  'Shipping',
  'Returns',
  'Contact us',
]

export function Footer() {
  return (
    <footer className="bg-ink text-paper w-full">
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
      <div className="grid items-end border-b border-white/10 pt-16 px-12 pb-12 grid-cols-[1.4fr_1fr] gap-12">
        <div className="font-display italic font-medium text-[124px] leading-[0.9] tracking-[-0.035em]">
          Periods
          <br />
          made <span className="text-pink">convenient.</span>
        </div>
        <NewsletterColumn fontSize="lg" />
      </div>

      {/* Columns */}
      <div className="grid pt-12 px-12 pb-9 grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-12">
        <BrandColumn lockupHeight={72} />
        <FootCol title="Shop" items={SHOP} />
        <FootCol title="Learn" items={LEARN} />
        <FootCol title="Company" items={COMPANY} />
        <FootCol title="Help" items={HELP} />
      </div>

      <BottomRow density="lg" />
    </div>
  )
}

// ─── TABLET (md - lg) ───────────────────────────────────────────────────
function TabletFooter() {
  return (
    <div className="hidden md:block lg:hidden">
      <div className="grid items-end border-b border-white/10 pt-12 px-10 pb-9 grid-cols-1 gap-6">
        <div className="font-display italic font-medium text-[64px] leading-[0.9] tracking-[-0.035em]">
          Periods
          <br />
          made <span className="text-pink">convenient.</span>
        </div>
        <NewsletterColumn fontSize="md" />
      </div>

      <div className="grid pt-10 px-10 pb-8 grid-cols-[1.6fr_1fr_1fr] gap-8">
        <BrandColumn lockupHeight={60} />
        <FootCol title="Shop & Learn" items={SHOP_LEARN_COMPACT} />
        <FootCol title="Company & Help" items={COMPANY_HELP_COMPACT} />
      </div>

      <BottomRow density="md" />
    </div>
  )
}

// ─── MOBILE (< md) ──────────────────────────────────────────────────────
function MobileFooter() {
  return (
    <div className="block md:hidden pt-10 px-5 pb-7">
      <div className="font-display italic font-medium text-[56px] leading-[0.92] tracking-[-0.03em] mb-8">
        Periods
        <br />
        made <span className="text-pink">convenient.</span>
      </div>

      {/* Newsletter */}
      <div className="t-eyebrow mb-3 text-white/55">The newsletter</div>
      <p className="text-[14px] mb-3.5 leading-[1.6] text-white/78">
        Period care, restocks, the occasional 10% off. Two emails a month, max.
      </p>
      <NewsletterInput mobile />

      <div className="mt-7">
        <Accordion
          title="Shop"
          items={['Period pants', 'Reusable pads', 'The starter set', 'Education', 'Gift cards']}
        />
        <Accordion
          title="Learn"
          items={['My Cycoo guide', 'FLOW Game', 'Care instructions', 'Size guide', 'FAQ']}
        />
        <Accordion
          title="Company"
          items={['Our story', 'Sustainability', 'Partnerships', 'Press']}
        />
        <Accordion title="Help" items={['Track order', 'Shipping', 'Returns', 'Contact us']} />
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2.5 py-6 border-b border-white/12">
        <FootContact icon={<IconPin size={14} />}>Abuja, FCT, Nigeria</FootContact>
        <FootContact icon={<IconMail size={14} />}>hi@mensaproducts.com</FootContact>
        <FootContact icon={<IconPhone size={14} />}>+234 707 534 5496</FootContact>
      </div>

      <div className="flex gap-2.5 py-5.5">
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
function NewsletterColumn({ fontSize }: { fontSize: 'lg' | 'md' }) {
  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="t-eyebrow text-white/55">The newsletter</div>
      <p
        className={cn(
          'max-w-95 text-white leading-[1.55]',
          fontSize === 'lg' ? 'text-[18px]' : 'text-[15px]',
        )}
      >
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
      className={cn(
        'flex border border-white/30 overflow-hidden rounded-md',
        mobile ? 'max-w-full' : 'max-w-105',
      )}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className={cn(
          'flex-1 bg-transparent border-none text-paper outline-none placeholder:text-white/55 font-sans',
          mobile ? 'py-3 px-3.5 text-[14px]' : 'py-3.5 px-4 text-[15px]',
        )}
      />
      <button
        type="submit"
        className={cn(
          'bg-pink text-white border-0 cursor-pointer font-sans font-medium hover:bg-pink-deep',
          mobile ? 'px-4.5 text-[13px]' : 'px-5.5 text-[14px]',
        )}
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
      <p className="text-[14px] mt-5.5 max-w-70 leading-[1.6] text-white/70">
        Reusable period products designed in Abuja for Nigerian women. Comfortable. Confident.
        Sustainable.
      </p>
      <div className="flex flex-col gap-2 mt-5.5">
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
            <Link to="/" className="text-[14px] text-paper no-underline hover:text-pink">
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
      <span className="text-pink">{icon}</span>
      {children}
    </div>
  )
}

function PayChip({ children }: { children: ReactNode }) {
  return (
    <span className="border border-white/20 text-white/85 font-sans rounded-sm py-1.25 px-2.5 text-[11.5px] tracking-[0.04em]">
      {children}
    </span>
  )
}

function SocialDotDark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-white/25 text-paper font-sans w-8 h-8 text-[10.5px] font-semibold tracking-[0.04em]">
      {label}
    </span>
  )
}

function Accordion({ title, items }: { title: string; items: string[] }) {
  return (
    <details className="border-b border-white/12">
      <summary className="list-none cursor-pointer flex items-center justify-between text-paper font-sans font-medium py-4.5 text-[15px]">
        {title}
        <IconChevronDown size={16} className="text-paper" />
      </summary>
      <ul className="list-none m-0 pb-4.5 pl-0 pr-0 pt-0 flex flex-col gap-2.5">
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

function BottomRow({ density }: { density: 'lg' | 'md' }) {
  return (
    <div
      className={cn(
        'border-t border-white/10 flex items-center justify-between gap-6 flex-wrap text-white/55 py-5 text-[12.5px]',
        density === 'lg' ? 'px-12' : 'px-10',
      )}
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
