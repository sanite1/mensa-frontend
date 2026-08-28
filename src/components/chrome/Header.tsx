// Header — single responsive site header, auth and cart aware, owns the mega menu and mobile drawer state.
import { useRef, useState } from 'react'
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
import { SearchOverlay } from './SearchOverlay'
import { IconSearch, IconUser, IconBag, IconMenu, IconChevronDown } from './icons'

interface NavLinkSpec {
  label: string
  href: string
  hasMenu?: boolean
}

const navLinks: NavLinkSpec[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop', hasMenu: true },
  { label: 'Our Story', href: '/about' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Journal', href: '/journal' },
]

const MEGA_CLOSE_DELAY_MS = 120

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const totalItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openDrawer)
  const cartBadge = totalItems > 0 ? totalItems : null
  const openSearch = () => setSearchOpen(true)

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
    <header className="bg-(--paper) border-b border-(--hairline-soft) sticky top-0 z-40">
      {/* Mobile: slim banner. Desktop/Tablet: utility strip. */}
      <div className="hidden md:block">
        <UtilityStrip />
      </div>

      {/* DESKTOP (≥ lg) */}
      <DesktopRow
        megaOpen={megaOpen}
        onShopEnter={openMega}
        onShopLeave={scheduleMegaClose}
        cartBadge={cartBadge}
        onCartClick={openCart}
        onSearchClick={openSearch}
      />

      {/* TABLET (md → lg) */}
      <TabletRow
        onMenuClick={() => setDrawerOpen(true)}
        cartBadge={cartBadge}
        onCartClick={openCart}
        onSearchClick={openSearch}
      />

      {/* MOBILE (< md) */}
      <MobileRow
        onMenuClick={() => setDrawerOpen(true)}
        cartBadge={cartBadge}
        onCartClick={openCart}
        onSearchClick={openSearch}
      />

      {/* Mega menu, desktop only, absolutely positioned so it overlays rather than pushes content. */}
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

// ─── DESKTOP ROW ────────────────────────────────────────────────────────
function DesktopRow({
  megaOpen,
  onShopEnter,
  onShopLeave,
  cartBadge,
  onCartClick,
  onSearchClick,
}: {
  megaOpen: boolean
  onShopEnter: () => void
  onShopLeave: () => void
  cartBadge: number | null
  onCartClick: () => void
  onSearchClick: () => void
}) {
  return (
    <div className="hidden lg:grid items-center grid-cols-[1fr_auto_1fr] py-5 px-12 gap-8">
      <div className="flex items-center">
        <Link to="/" aria-label="Mensa home">
          <MensaWordmark height={36} />
        </Link>
      </div>
      <nav className="flex items-center gap-9">
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
        <NavIconBtn label="Search" onClick={onSearchClick}>
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
          'inline-flex items-center gap-1 text-[14.5px] font-medium text-ink py-2.5 no-underline transition-colors tracking-[0.01em]',
          'border-b-[1.5px]',
          activeMenu || isCurrent ? 'border-ink' : 'border-transparent',
        )}
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
        'inline-flex items-center gap-1 text-[14.5px] font-medium text-ink py-2.5 no-underline transition-colors tracking-[0.01em]',
        'border-b-[1.5px]',
        isCurrent ? 'border-ink' : 'border-transparent hover:border-hairline',
      )}
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
  onSearchClick,
}: {
  onMenuClick: () => void
  cartBadge: number | null
  onCartClick: () => void
  onSearchClick: () => void
}) {
  return (
    <div className="hidden md:grid lg:hidden items-center grid-cols-[auto_1fr_auto] py-4 px-6 gap-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-(--ink) hover:bg-(--cream)"
      >
        <IconMenu />
      </button>
      <div className="flex justify-center">
        <Link to="/" aria-label="Mensa home">
          <MensaWordmark height={32} />
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <NavIconBtn label="Search" onClick={onSearchClick}>
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
  onSearchClick,
}: {
  onMenuClick: () => void
  cartBadge: number | null
  onCartClick: () => void
  onSearchClick: () => void
}) {
  return (
    // 1fr_auto_1fr keeps the wordmark dead-centre in the viewport even
    // though the right flank holds two icons and the left only one.
    <div className="grid md:hidden items-center grid-cols-[1fr_auto_1fr] py-3 px-3.5 gap-1">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center justify-self-start rounded-sm text-(--ink)"
      >
        <IconMenu />
      </button>
      <Link to="/" aria-label="Mensa home" className="justify-self-center">
        <MensaWordmark height={26} />
      </Link>
      <div className="flex items-center gap-1 justify-self-end">
        <NavIconBtn label="Search" onClick={onSearchClick}>
          <IconSearch size={20} />
        </NavIconBtn>
        <NavIconBtn label="Cart" onClick={onCartClick} badge={cartBadge}>
          <IconBag size={20} />
        </NavIconBtn>
      </div>
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
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-sm bg-transparent text-(--ink) hover:bg-(--cream)"
        >
          <IconUser />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-(--paper) border border-(--hairline) rounded-none min-w-50"
      >
        <DropdownMenuLabel className="text-(--mute) uppercase text-[11px] tracking-[0.12em] font-medium">
          Signed in as
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-[14px] text-(--ink) truncate">{user.email}</div>
        <DropdownMenuSeparator className="bg-(--hairline-soft)" />
        <DropdownMenuItem asChild>
          <Link to="/account" className="text-(--ink) text-[14px]">
            My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders" className="text-(--ink) text-[14px]">
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-(--hairline-soft)" />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          className="text-(--ink) text-[14px] cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
