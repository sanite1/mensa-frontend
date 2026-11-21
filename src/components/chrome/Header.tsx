// Header: the design system's sticky nav. It blurs once the page scrolls and
// collapses into a full width menu on mobile. Carries our own features too:
// the live Shop mega menu, product search, currency, account menu and cart.
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore, useIsAuthenticated } from '@/lib/network/stores/auth.store'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useLogout } from '@/lib/network/api/auth.api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import logoSrc from '@/assets/mensa_logo.png'
import { MegaMenu } from './MegaMenu'
import { SearchOverlay } from './SearchOverlay'
import { CurrencyPicker } from './CurrencyPicker'

const links = [
  { href: '/shop', label: 'Shop', mega: true },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/find-my-starter-set', label: 'Find your fit' },
  { href: '/about', label: 'Our story' },
  { href: '/partnerships', label: 'Partnerships' },
  { href: '/journal', label: 'Journal' },
]

// Shown only in the mobile menu, desktop reaches these from the footer.
const mobileExtras = [
  { href: '/education', label: 'Education' },
  { href: '/orders/track', label: 'Track an order' },
  { href: '/contact', label: 'Help' },
]

const MEGA_CLOSE_DELAY_MS = 120

export function Header() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const count = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openDrawer)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Every overlay closes on navigation.
  useEffect(() => {
    setOpen(false)
    setMegaOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  // A short delay lets the cursor travel from the Shop link into the panel.
  const cancelMegaClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const scheduleMegaClose = () => {
    cancelMegaClose()
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), MEGA_CLOSE_DELAY_MS)
  }
  const openMega = () => {
    cancelMegaClose()
    setMegaOpen(true)
  }

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <div className="wrap nav__inner">
        <button
          type="button"
          className="icon-btn menu-btn"
          aria-label={open ? 'Close menu' : 'Menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg>
              <use href="#i-menu" />
            </svg>
          )}
        </button>

        <nav className={`nav__links${open ? ' is-open' : ''}`} aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              aria-current={isCurrent(l.href) ? 'page' : undefined}
              onMouseEnter={l.mega ? openMega : undefined}
              onMouseLeave={l.mega ? scheduleMegaClose : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {open ? (
            <>
              {mobileExtras.map((l) => (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <MobileAccountLinks onNavigate={() => setOpen(false)} />
              <div className="text-base">
                <CurrencyPicker tone="light" />
              </div>
            </>
          ) : null}
        </nav>

        <Link className="nav__logo" to="/" aria-label="Mensa home">
          <img src={logoSrc} alt="Mensa Period Products" />
        </Link>

        <div className="nav__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
          >
            <svg>
              <use href="#i-search" />
            </svg>
          </button>
          <AccountButton />
          <button
            type="button"
            className="icon-btn"
            aria-label={`Bag, ${count} item${count === 1 ? '' : 's'}`}
            onClick={openCart}
          >
            <svg>
              <use href="#i-bag" />
            </svg>
            {count > 0 ? (
              <span className="bag-count" key={count}>
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Mega menu, desktop only. Overlays the page rather than pushing it. */}
      {megaOpen ? (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full z-30 bg-(--paper) shadow-(--shadow) animate-in fade-in duration-150"
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

// Signed out: a link to sign in. Signed in: a small account menu.
function AccountButton() {
  const isAuthed = useIsAuthenticated()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  if (!isAuthed || !user) {
    return (
      <Link className="icon-btn" to="/login" aria-label="Sign in" title="Sign in">
        <svg>
          <use href="#i-user" />
        </svg>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="icon-btn" aria-label="Account menu">
          <svg>
            <use href="#i-user" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-56 rounded-(--r-sm) border-(--line) bg-(--white) p-1.5 shadow-(--shadow)"
      >
        <DropdownMenuLabel className="text-(--mute) text-(length:--fs-xs) font-medium uppercase tracking-[.14em]">
          Signed in as
        </DropdownMenuLabel>
        <div className="truncate px-2 pb-2 text-(length:--fs-sm) text-(--ink)">{user.email}</div>
        <DropdownMenuSeparator className="bg-(--line)" />
        <DropdownMenuItem asChild>
          <Link to="/account" className="text-(length:--fs-sm) text-(--ink)">
            My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders" className="text-(length:--fs-sm) text-(--ink)">
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-(--line)" />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          className="cursor-pointer text-(length:--fs-sm) text-(--ink)"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileAccountLinks({ onNavigate }: { onNavigate: () => void }) {
  const isAuthed = useIsAuthenticated()
  const logout = useLogout()
  if (!isAuthed) {
    return (
      <Link to="/login" onClick={onNavigate}>
        Sign in
      </Link>
    )
  }
  return (
    <>
      <Link to="/account" onClick={onNavigate}>
        My account
      </Link>
      <button
        type="button"
        className="text-left"
        onClick={() => {
          onNavigate()
          logout.mutate()
        }}
      >
        Sign out
      </button>
    </>
  )
}
