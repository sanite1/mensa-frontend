// Footer — single responsive component.
import { Link } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useSubscribeToNewsletter } from '@/lib/network/api/newsletter.api'
import { MensaLockup } from './MensaWordmark'
import { IconMail, IconChevronDown, IconInstagram, IconTikTok } from './icons'
import { Spinner } from '@/components/ui/spinner'

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@shopmensa_',
    href: 'https://instagram.com/shopmensa_',
    Icon: IconInstagram,
  },
  {
    label: 'TikTok',
    handle: '@shopmensa',
    href: 'https://www.tiktok.com/@shopmensa',
    Icon: IconTikTok,
  },
] as const

/** Footer link spec. `href` lands at an existing route when we have one,
 *  otherwise it stays at `/` until that surface ships — so the footer
 *  never sends a visitor to a 404. */
type FootLink = { label: string; href: string }

const SHOP: FootLink[] = [
  { label: 'Period pants', href: '/shop?category=pants' },
  { label: 'Reusable pads', href: '/shop?category=pads' },
  { label: 'The starter set', href: '/shop?category=bundles' },
  { label: 'Education', href: '/shop?category=education' },
]
const LEARN: FootLink[] = [
  { label: 'Education library', href: '/education' },
  { label: 'My Cycoo guide', href: '/shop?category=education' },
  { label: 'FLOW Game', href: '/shop?category=education' },
  { label: 'Journal', href: '/journal' },
]
const COMPANY: FootLink[] = [
  { label: 'Our story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
]
const HELP: FootLink[] = [
  { label: 'Track order', href: '/orders/track' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]
const SHOP_LEARN_COMPACT: FootLink[] = [
  { label: 'Period pants', href: '/shop?category=pants' },
  { label: 'Reusable pads', href: '/shop?category=pads' },
  { label: 'The starter set', href: '/shop?category=bundles' },
  { label: 'Education library', href: '/education' },
  { label: 'Journal', href: '/journal' },
]
const COMPANY_HELP_COMPACT: FootLink[] = [
  { label: 'Our story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Track order', href: '/orders/track' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]
const MOBILE_SHOP: FootLink[] = [
  { label: 'Period pants', href: '/shop?category=pants' },
  { label: 'Reusable pads', href: '/shop?category=pads' },
  { label: 'The starter set', href: '/shop?category=bundles' },
  { label: 'Education', href: '/shop?category=education' },
]
const MOBILE_LEARN: FootLink[] = [
  { label: 'Education library', href: '/education' },
  { label: 'Journal', href: '/journal' },
]
const MOBILE_COMPANY: FootLink[] = [
  { label: 'Our story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
]
const MOBILE_HELP: FootLink[] = [
  { label: 'Track order', href: '/orders/track' },
  { label: 'Returns', href: '/returns' },
  { label: 'Contact us', href: '/contact' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
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
        <Accordion title="Shop" items={MOBILE_SHOP} />
        <Accordion title="Learn" items={MOBILE_LEARN} />
        <Accordion title="Company" items={MOBILE_COMPANY} />
        <Accordion title="Help" items={MOBILE_HELP} />
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2.5 py-6 border-b border-white/12">
        <FootContact icon={<IconMail size={14} />}>hi@mensaproducts.com</FootContact>
      </div>

      <div className="flex gap-2.5 py-5.5">
        <SocialLinks />
      </div>

      <div className="flex flex-col gap-1 text-[12px] text-white/55 mb-2">
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
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const subscribe = useSubscribeToNewsletter()

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    subscribe.mutate(
      { email: trimmed, source: 'footer' },
      {
        onSuccess: () => {
          setDone(true)
          setEmail('')
        },
      },
    )
  }

  if (done) {
    return (
      <div
        className={cn(
          'flex items-center text-paper border border-white/30 rounded-md',
          mobile ? 'py-3 px-3.5 text-[14px]' : 'py-3.5 px-4 text-[15px]',
        )}
      >
        You are on the list. Watch your inbox.
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'flex border border-white/30 overflow-hidden rounded-md',
        mobile ? 'max-w-full' : 'max-w-105',
      )}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoComplete="email"
        className={cn(
          'flex-1 bg-transparent border-none text-paper outline-none placeholder:text-white/55 font-sans',
          mobile ? 'py-3 px-3.5 text-[14px]' : 'py-3.5 px-4 text-[15px]',
        )}
      />
      <button
        type="submit"
        disabled={subscribe.isPending}
        className={cn(
          'bg-pink text-white border-0 cursor-pointer font-sans font-medium hover:bg-pink-deep disabled:opacity-60 disabled:cursor-default',
          mobile ? 'px-4.5 text-[13px]' : 'px-5.5 text-[14px]',
        )}
      >
        {subscribe.isPending ? <Spinner size={14} /> : 'Subscribe'}
      </button>
    </form>
  )
}

function BrandColumn({ lockupHeight }: { lockupHeight: number }) {
  return (
    <div>
      <MensaLockup height={lockupHeight} tone="paper" />
      <p className="text-[14px] mt-5.5 max-w-70 leading-[1.6] text-white/70">
        Sustainable period products designed for the modern woman. Comfortable. Confident.
        Sustainable.
      </p>
      <div className="flex flex-col gap-2 mt-5.5">
        <FootContact icon={<IconMail size={14} />}>hi@mensaproducts.com</FootContact>
      </div>
    </div>
  )
}

function FootCol({ title, items }: { title: string; items: FootLink[] }) {
  return (
    <div>
      <div className="t-eyebrow mb-4 text-white/55">{title}</div>
      <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <FootAnchor href={item.href} className="text-paper hover:text-pink">
              {item.label}
            </FootAnchor>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Picks the right element: react-router Link for in-app paths, plain
 *  <a> for mailto: / tel: / absolute URLs (those can't go through Link). */
function FootAnchor({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const cls = cn('text-[14px] no-underline', className)
  if (/^(mailto:|tel:|https?:)/.test(href)) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
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

function SocialLinks() {
  return (
    <>
      {SOCIALS.map(({ label, handle, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} ${handle}`}
          title={`${label} ${handle}`}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/25 text-paper hover:bg-paper hover:text-ink transition-colors no-underline"
        >
          <Icon size={15} />
        </a>
      ))}
    </>
  )
}

function Accordion({ title, items }: { title: string; items: FootLink[] }) {
  return (
    <details className="border-b border-white/12">
      <summary className="list-none cursor-pointer flex items-center justify-between text-paper font-sans font-medium py-4.5 text-[15px]">
        {title}
        <IconChevronDown size={16} className="text-paper" />
      </summary>
      <ul className="list-none m-0 pb-4.5 pl-0 pr-0 pt-0 flex flex-col gap-2.5">
        {items.map((i) => (
          <li key={i.label}>
            <FootAnchor href={i.href} className="text-white/75">
              {i.label}
            </FootAnchor>
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
      <div className="flex gap-2">
        <SocialLinks />
      </div>
    </div>
  )
}
