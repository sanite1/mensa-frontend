// ─────────────────────────────────────────────────────────────────────────
// MobileDrawer — slide-in from the left on mobile.
// Built on shadcn Sheet (Radix Dialog under the hood) for a11y + focus
// management, restyled to the Mensa design (cream-soft search, large
// editorial nav items, blush social dots).
// ─────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { MensaWordmark } from './MensaWordmark'
import {
  IconClose,
  IconSearch,
  IconUser,
  IconTruck,
  IconMail,
  IconChevronRight,
  IconChevronDown,
} from './icons'

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navItems = [
  { label: 'Shop', href: '/shop', sub: true },
  { label: 'Education', href: '/education', sub: true },
  { label: 'Our Story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Journal', href: '/journal' },
]

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full max-w-md p-0 bg-[var(--paper)] border-r border-[var(--hairline-soft)]"
      >
        <SheetTitle className="sr-only">Mensa main menu</SheetTitle>
        {/* Top: logo + close */}
        <SheetHeader className="flex flex-row items-center justify-between p-0 px-[18px] py-[14px] border-b border-[var(--hairline-soft)] space-y-0">
          <MensaWordmark height={26} />
          <SheetClose
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[var(--ink)] hover:bg-[var(--cream)]"
            aria-label="Close"
          >
            <IconClose />
          </SheetClose>
        </SheetHeader>

        {/* Search inline */}
        <div className="px-[18px] py-4">
          <div className="relative">
            <IconSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--mute)]"
            />
            <input
              type="search"
              placeholder="Search products, articles…"
              className="h-11 w-full pl-[42px] pr-3.5 bg-[var(--cream-soft)] border border-[var(--hairline-soft)] text-[15px] text-[var(--ink)] placeholder:text-[var(--mute)] focus-visible:outline-none focus-visible:border-[var(--ink)]"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="px-[18px] pb-2 flex-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.label}>
              <Link
                to={item.href}
                className="flex items-center justify-between border-b border-[var(--hairline-soft)] py-[18px] text-[var(--ink)] no-underline"
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 28,
                    lineHeight: 1.1,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {item.label}
                </span>
                {item.sub ? (
                  <IconChevronRight size={20} className="text-[var(--graphite)]" />
                ) : null}
              </Link>
            </SheetClose>
          ))}
        </nav>

        {/* Secondary actions */}
        <div className="px-[18px] pb-3 pt-2 flex flex-col gap-1">
          <DrawerLink icon={<IconUser size={18} />} href="/login">
            Login or register
          </DrawerLink>
          <DrawerLink icon={<IconTruck size={18} />} href="/track">
            Track order
          </DrawerLink>
          <DrawerLink icon={<IconMail size={18} />} href="mailto:hi@mensaproducts.com">
            hi@mensaproducts.com
          </DrawerLink>
        </div>

        {/* Footer of drawer: socials, currency */}
        <div className="px-[18px] py-[22px] border-t border-[var(--hairline-soft)] bg-[var(--cream-soft)] flex items-center justify-between">
          <div className="flex gap-3.5">
            <SocialDot label="IG" />
            <SocialDot label="TT" />
            <SocialDot label="X" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[14px] text-[var(--graphite)]">
            <span
              className="inline-block rounded-[1px]"
              style={{
                width: 14,
                height: 9,
                background: 'linear-gradient(to right,#008751 50%,#fff 50%)',
              }}
            />
            Nigeria · NGN
            <IconChevronDown size={12} />
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DrawerLink({
  children,
  icon,
  href,
}: {
  children: ReactNode
  icon: ReactNode
  href: string
}) {
  return (
    <SheetClose asChild>
      <Link
        to={href}
        className="flex items-center gap-3 py-3 no-underline text-[var(--ink)] font-sans text-[15px] font-medium"
      >
        <span className="text-[var(--graphite)]">{icon}</span>
        {children}
      </Link>
    </SheetClose>
  )
}

function SocialDot({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--paper)] text-[var(--ink)] font-sans"
      style={{ width: 36, height: 36, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}
    >
      {label}
    </span>
  )
}
