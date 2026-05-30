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
        className="w-full max-w-md p-0 bg-(--paper) border-r border-(--hairline-soft)"
      >
        <SheetTitle className="sr-only">Mensa main menu</SheetTitle>
        {/* Top: logo + close */}
        <SheetHeader className="flex flex-row items-center justify-between p-0 px-4.5 py-3.5 border-b border-(--hairline-soft) space-y-0">
          <MensaWordmark height={26} />
          <SheetClose
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-(--ink) hover:bg-(--cream)"
            aria-label="Close"
          >
            <IconClose />
          </SheetClose>
        </SheetHeader>

        {/* Search inline */}
        <div className="px-4.5 py-4">
          <div className="relative">
            <IconSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--mute)"
            />
            <input
              type="search"
              placeholder="Search products, articles…"
              className="h-11 w-full pl-10.5 pr-3.5 bg-(--cream-soft) border border-(--hairline-soft) text-[15px] text-(--ink) placeholder:text-(--mute) focus-visible:outline-none focus-visible:border-(--ink)"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="px-4.5 pb-2 flex-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.label}>
              <Link
                to={item.href}
                className="flex items-center justify-between border-b border-(--hairline-soft) py-4.5 text-(--ink) no-underline"
              >
                <span className="font-display font-semibold text-[28px] leading-[1.1] tracking-[-0.015em]">
                  {item.label}
                </span>
                {item.sub ? <IconChevronRight size={20} className="text-(--graphite)" /> : null}
              </Link>
            </SheetClose>
          ))}
        </nav>

        {/* Secondary actions */}
        <div className="px-4.5 pb-3 pt-2 flex flex-col gap-1">
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
        <div className="px-4.5 py-5.5 border-t border-(--hairline-soft) bg-(--cream-soft) flex items-center justify-between">
          <div className="flex gap-3.5">
            <SocialDot label="IG" />
            <SocialDot label="TT" />
            <SocialDot label="X" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[14px] text-(--graphite)">
            <span
              aria-hidden
              className="inline-block rounded-px w-3.5 h-2.25 bg-ng-flag"
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
        className="flex items-center gap-3 py-3 no-underline text-(--ink) font-sans text-[15px] font-medium"
      >
        <span className="text-(--graphite)">{icon}</span>
        {children}
      </Link>
    </SheetClose>
  )
}

function SocialDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full border border-hairline bg-paper text-ink font-sans w-9 h-9 text-[11px] font-semibold tracking-[0.04em]">
      {label}
    </span>
  )
}
