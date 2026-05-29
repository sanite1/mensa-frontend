// ─────────────────────────────────────────────────────────────────────────
// MegaMenu — drops down under "Shop" on desktop. Four columns: Period
// pants, Reusable pads, Education, and a blush feature card.
//
// Slugs match those seeded by mensa-backend/src/scripts/seedProducts.ts.
// ─────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from './icons'

interface MegaMenuLink {
  label: string
  hint?: string
  href: string
}

const periodPants: MegaMenuLink[] = [
  { label: 'Pack of 5', hint: '₦25,000', href: '/shop/pack-of-5-pants' },
  { label: 'Pack of 3', hint: '₦16,500', href: '/shop/pack-of-3-pants' },
  { label: 'Single pant', hint: '₦6,500', href: '/shop/single-pant' },
  { label: 'Sport pant', hint: '₦7,500', href: '/shop/sport-pant' },
  { label: 'See all pants', href: '/shop?category=pants' },
]

const reusablePads: MegaMenuLink[] = [
  { label: 'Pack of 5, regular', hint: '₦4,500', href: '/shop/pads-regular' },
  { label: 'Pack of 5, heavy', hint: '₦6,500', href: '/shop/pads-heavy' },
  { label: 'See all pads', href: '/shop?category=pads' },
]

const education: MegaMenuLink[] = [
  { label: 'My Cycoo', hint: '₦2,500', href: '/shop/my-cycoo' },
  { label: 'Bulk for schools', href: '/partnerships' },
  { label: 'NGO partnerships', href: '/partnerships' },
  { label: 'See all education', href: '/shop?category=education' },
]

function Column({
  title,
  links,
  onLinkClick,
}: {
  title: string
  links: MegaMenuLink[]
  onLinkClick?: () => void
}) {
  return (
    <div>
      <div className="t-eyebrow mb-[18px] text-[var(--mute)]">{title}</div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              onClick={onLinkClick}
              className="flex items-baseline gap-2 text-[15px] text-[var(--ink)] no-underline font-sans hover:text-[var(--pink-deep)]"
            >
              {link.label}
              {link.hint ? (
                <span className="text-[13px] text-[var(--mute)]">· {link.hint}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface MegaMenuProps {
  /** Called when any link inside the menu is clicked, so the parent can
   *  immediately dismiss the dropdown (without waiting on the hover close
   *  delay). */
  onLinkClick?: () => void
}

export function MegaMenu({ onLinkClick }: MegaMenuProps = {}) {
  return (
    <div
      className="grid bg-[var(--paper)] border-t border-[var(--hairline-soft)]"
      style={{
        padding: '40px 48px 44px',
        gridTemplateColumns: '1.2fr 1.2fr 1.2fr 1.6fr',
        gap: 48,
      }}
    >
      <Column title="Period pants" links={periodPants} onLinkClick={onLinkClick} />
      <Column title="Reusable pads" links={reusablePads} onLinkClick={onLinkClick} />
      <Column title="Education" links={education} onLinkClick={onLinkClick} />

      {/* Feature card */}
      <div
        className="relative overflow-hidden bg-[var(--blush)]"
        style={{ borderRadius: 8, padding: 24 }}
      >
        <div className="t-eyebrow text-[var(--berry)]">New this season</div>
        <h3
          className="mt-2 text-[var(--berry)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
          }}
        >
          The starter set
        </h3>
        <p className="mt-2 text-[14px] max-w-[220px] text-[var(--graphite)]">
          3 pants + 5 reusable pads. Everything you need to switch.
        </p>
        <div className="mt-[18px] relative z-10">
          <Button asChild variant="primary" size="sm">
            <Link to="/shop/starter-set" onClick={onLinkClick}>
              Shop the set · ₦22,500
              <IconArrowRight size={14} />
            </Link>
          </Button>
        </div>
        {/* Placeholder until we have a real hero image for the starter set. */}
        <div
          className="absolute opacity-70 flex items-end"
          style={{
            right: -30,
            top: -10,
            width: 140,
            height: 180,
            background:
              'repeating-linear-gradient(45deg, var(--blush-2) 0 8px, var(--blush) 8px 16px)',
            borderRadius: 6,
            padding: 8,
          }}
        >
          <span className="t-micro text-[var(--berry)] opacity-70">product</span>
        </div>
      </div>
    </div>
  )
}
