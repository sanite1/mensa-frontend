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
      <div className="t-eyebrow mb-4.5 text-(--mute)">{title}</div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.href}
              onClick={onLinkClick}
              className="flex items-baseline gap-2 text-[15px] text-(--ink) no-underline font-sans hover:text-(--pink-deep)"
            >
              {link.label}
              {link.hint ? <span className="text-[13px] text-(--mute)">· {link.hint}</span> : null}
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
    <div className="grid bg-paper border-t border-hairline-soft pt-10 px-12 pb-11 grid-cols-[1.2fr_1.2fr_1.2fr_1.6fr] gap-12">
      <Column title="Period pants" links={periodPants} onLinkClick={onLinkClick} />
      <Column title="Reusable pads" links={reusablePads} onLinkClick={onLinkClick} />
      <Column title="Education" links={education} onLinkClick={onLinkClick} />

      {/* Feature card */}
      <div className="relative overflow-hidden bg-blush rounded-lg p-6">
        <div className="t-eyebrow text-berry">New this season</div>
        <h3 className="mt-2 text-berry font-display italic font-semibold text-[30px] leading-[1.1] tracking-[-0.015em]">
          The starter set
        </h3>
        <p className="mt-2 text-[14px] max-w-55 text-graphite">
          3 pants + 5 reusable pads. Everything you need to switch.
        </p>
        <div className="mt-4.5 relative z-10">
          <Button asChild variant="primary" size="sm">
            <Link to="/shop/starter-set" onClick={onLinkClick}>
              Shop the set · ₦22,500
              <IconArrowRight size={14} />
            </Link>
          </Button>
        </div>
        {/* Placeholder until we have a real hero image for the starter set.
            The blush stripe is an arbitrary background-image — no theme
            token has a gradient equivalent. */}
        <div className="absolute -right-7.5 -top-2.5 w-35 h-45 opacity-70 flex items-end rounded-md p-2 bg-blush-stripe">
          <span className="t-micro text-berry opacity-70">product</span>
        </div>
      </div>
    </div>
  )
}
