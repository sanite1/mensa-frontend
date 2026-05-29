// ─────────────────────────────────────────────────────────────────────────
// Header — single responsive component:
//   ≥ lg (1024)  → desktop layout: utility strip + 3-col grid (logo / nav / icons)
//   md – lg      → tablet: compact utility strip + hamburger / logo / icons
//   < md         → mobile: slim free-delivery banner + 4-col grid
//
// State: tracks mega menu open (desktop) and mobile drawer open (mobile).
// Auth-aware: shows the account icon as link to /login if signed out, or
// dropdown menu if signed in.
// Cart-aware: shows the cart badge from cart.store.
// ─────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { features, FREE_DELIVERY_THRESHOLD_LABEL } from '@/lib/features'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore, useIsAuthenticated } from '@/lib/network/stores/auth.store'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useLogout } from '@/lib/network/api/auth.api'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { MensaWordmark } from './MensaWordmark'
import { UtilityStrip } from './UtilityStrip'
import { NavIconBtn } from './NavIconBtn'
import { MegaMenu } from './MegaMenu'
import { MobileDrawer } from './MobileDrawer'
import {
  IconSearch,
  IconUser,
  IconBag,
  IconMenu,
  IconChevronDown,
} from './icons'

interface NavLinkSpec {
  label: string
  href: string
  hasMenu?: boolean
}

const navLinks: NavLinkSpec[] = [
  { label: 'Shop', href: '/shop', hasMenu: true },
  { label: 'Education', href: '/education', hasMenu: true },
  { label: 'Our Story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Journal', href: '/journal' },
]

const MEGA_CLOSE_DELAY_MS = 120

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openDrawer)
  const cartBadge = totalItems > 0 ? totalItems : null

  // Schedule a delayed close — gives the cursor a moment to travel between
  // the Shop link and the menu panel without accidentally dismissing it.
  const scheduleMegaClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), MEGA_CLOSE_DELAY_MS)
  }
  const cancelMegaClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const openMega = () => {
    cancelMegaClose()
    setMegaOpen(true)
  }

  return (
    <header className="bg-[var(--paper)] border-b border-[var(--hairline-soft)] sticky top-0 z-40">
      {/* Mobile: slim banner. Desktop/Tablet: utility strip. */}
      <div className="hidden md:block">
        <UtilityStrip />
      </div>
      <MobileBanner />

      {/* DESKTOP (≥ lg) */}
      <DesktopRow
        megaOpen={megaOpen}
        onShopEnter={openMega}
        onShopLeave={scheduleMegaClose}
        cartBadge={cartBadge}
        onCartClick={openCart}
      />

      {/* TABLET (md → lg) */}
      <TabletRow
        onMenuClick={() => setDrawerOpen(true)}
        cartBadge={cartBadge}
        onCartClick={openCart}
      />

      {/* MOBILE (< md) */}
      <MobileRow
        onMenuClick={() => setDrawerOpen(true)}
        cartBadge={cartBadge}
        onCartClick={openCart}
      />

      {/* MEGA MENU (desktop only) — absolutely positioned so it overlays the
          page content below instead of pushing it down. Fade in on open;
          link clicks dismiss immediately so navigation feels crisp. */}
      {megaOpen ? (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full z-30 shadow-[0_24px_60px_-20px_rgba(26,20,16,0.18)] animate-in fade-in duration-150"
          onMouseEnter={cancelMegaClose}
          onMouseLeave={scheduleMegaClose}
        >
          <MegaMenu
            onLinkClick={() => {
              cancelMegaClose()
              setMegaOpen(false)
            }}
          />
        </div>
      ) : null}

      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </header>
  )
}

// ── Mobile-only top banner (slim, no currency / track) ──
function MobileBanner() {
  // Only shown when the free-delivery flag is on. Hidden otherwise so the
  // header doesn't surface a promo we aren't honoring.
  if (!features.freeDelivery) return null
  return (
    <div
      className="md:hidden bg-[var(--ink)] text-[var(--paper)] text-center"
      style={{ padding: '7px 16px', fontSize: 11.5, letterSpacing: '0.04em' }}
    >
      Free delivery in Abuja &amp; Lagos over {FREE_DELIVERY_THRESHOLD_LABEL}
    </div>
  )
}

// ─── DESKTOP ROW ────────────────────────────────────────────────────────
function DesktopRow({
  megaOpen,
  onShopEnter,
  onShopLeave,
  cartBadge,
  onCartClick,
}: {
  megaOpen: boolean
  onShopEnter: () => void
  onShopLeave: () => void
  cartBadge: number | null
  onCartClick: () => void
}) {
  return (
    <div
      className="hidden lg:grid items-center"
      style={{
        gridTemplateColumns: '1fr auto 1fr',
        padding: '20px 48px',
        gap: 32,
      }}
    >
      <div className="flex items-center">
        <Link to="/" aria-label="Mensa home">
          <MensaWordmark height={36} />
        </Link>
      </div>
      <nav className="flex items-center" style={{ gap: 36 }}>
        {navLinks.map((link) => (
          <DesktopNavLink
            key={link.label}
            link={link}
            activeMenu={megaOpen && link.label === 'Shop'}
            onShopEnter={onShopEnter}
            onShopLeave={onShopLeave}
          />
        ))}
      </nav>
      <div className="flex items-center justify-end gap-1">
        <NavIconBtn label="Search" href="/search">
          <IconSearch />
        </NavIconBtn>
        <AccountIcon />
        <NavIconBtn label="Cart" onClick={onCartClick} badge={cartBadge}>
          <IconBag />
        </NavIconBtn>
      </div>
    </div>
  )
}

function DesktopNavLink({
  link,
  activeMenu,
  onShopEnter,
  onShopLeave,
}: {
  link: NavLinkSpec
  activeMenu: boolean
  onShopEnter: () => void
  onShopLeave: () => void
}) {
  const { pathname } = useLocation()
  const isCurrent = pathname.startsWith(link.href)

  if (link.hasMenu && link.label === 'Shop') {
    // Shop: click navigates to /shop, hover opens the mega menu.
    return (
      <Link
        to={link.href}
        onMouseEnter={onShopEnter}
        onMouseLeave={onShopLeave}
        onClick={onShopLeave}
        className={cn(
          'inline-flex items-center gap-1 text-[14.5px] font-medium text-[var(--ink)] py-2.5 no-underline transition-colors',
          'border-b-[1.5px]',
          activeMenu || isCurrent ? 'border-[var(--ink)]' : 'border-transparent',
        )}
        style={{ letterSpacing: '0.01em' }}
      >
        {link.label}
        <IconChevronDown size={14} />
      </Link>
    )
  }

  return (
    <Link
      to={link.href}
      className={cn(
        'inline-flex items-center gap-1 text-[14.5px] font-medium text-[var(--ink)] py-2.5 no-underline transition-colors',
        'border-b-[1.5px]',
        isCurrent ? 'border-[var(--ink)]' : 'border-transparent hover:border-[var(--hairline)]',
      )}
      style={{ letterSpacing: '0.01em' }}
    >
      {link.label}
      {link.hasMenu ? <IconChevronDown size={14} /> : null}
    </Link>
  )
}

// ─── TABLET ROW ─────────────────────────────────────────────────────────
function TabletRow({
  onMenuClick,
  cartBadge,
  onCartClick,
}: {
  onMenuClick: () => void
  cartBadge: number | null
  onCartClick: () => void
}) {
  return (
    <div
      className="hidden md:grid lg:hidden items-center"
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        padding: '16px 24px',
        gap: 16,
      }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[var(--ink)] hover:bg-[var(--cream)]"
      >
        <IconMenu />
      </button>
      <div className="flex justify-center">
        <Link to="/" aria-label="Mensa home">
          <MensaWordmark height={32} />
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <NavIconBtn label="Search" href="/search">
          <IconSearch />
        </NavIconBtn>
        <AccountIcon />
        <NavIconBtn label="Cart" onClick={onCartClick} badge={cartBadge}>
          <IconBag />
        </NavIconBtn>
      </div>
    </div>
  )
}

// ─── MOBILE ROW ─────────────────────────────────────────────────────────
function MobileRow({
  onMenuClick,
  cartBadge,
  onCartClick,
}: {
  onMenuClick: () => void
  cartBadge: number | null
  onCartClick: () => void
}) {
  return (
    <div
      className="grid md:hidden items-center"
      style={{
        gridTemplateColumns: 'auto 1fr auto auto',
        padding: '12px 14px',
        gap: 4,
      }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-[var(--ink)]"
      >
        <IconMenu />
      </button>
      <div className="flex justify-center">
        <Link to="/" aria-label="Mensa home">
          <MensaWordmark height={26} />
        </Link>
      </div>
      <NavIconBtn label="Search" href="/search">
        <IconSearch size={20} />
      </NavIconBtn>
      <NavIconBtn label="Cart" onClick={onCartClick} badge={cartBadge}>
        <IconBag size={20} />
      </NavIconBtn>
    </div>
  )
}

// ─── Account icon — dropdown if signed in, link to /login if not ──────
function AccountIcon() {
  const isAuthed = useIsAuthenticated()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  if (!isAuthed || !user) {
    return (
      <NavIconBtn label="Sign in" href="/login">
        <IconUser />
      </NavIconBtn>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm bg-transparent text-[var(--ink)] hover:bg-[var(--cream)]"
        >
          <IconUser />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[var(--paper)] border border-[var(--hairline)] rounded-none min-w-[200px]"
      >
        <DropdownMenuLabel className="text-[var(--mute)] uppercase text-[11px] tracking-[0.12em] font-medium">
          Signed in as
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-[14px] text-[var(--ink)] truncate">{user.email}</div>
        <DropdownMenuSeparator className="bg-[var(--hairline-soft)]" />
        <DropdownMenuItem asChild>
          <Link to="/account" className="text-[var(--ink)] text-[14px]">
            My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders" className="text-[var(--ink)] text-[14px]">
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--hairline-soft)]" />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          className="text-[var(--ink)] text-[14px] cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
