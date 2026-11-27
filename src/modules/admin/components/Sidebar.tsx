// Admin sidebar in the design's Studio look: dark rail, rounded nav links,
// storefront link and the signed in admin at the foot.
import { NavLink } from 'react-router-dom'
import {
  Briefcase,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Tag,
  Truck,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useLogout } from '@/lib/network/api/auth.api'
import { buildAppUrl } from '@/lib/network/helpers/buildAppUrl'
import { Avatar } from '@/modules/admin/components/ui'
import { cn } from '@/lib/utils'
import logo from '@/assets/mensa_logo.png'

const items: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Invoices', href: '/invoices', icon: Receipt },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Discounts', href: '/discounts', icon: Tag },
  { label: 'Shipping', href: '/shipping', icon: Truck },
  { label: 'Content', href: '/content', icon: FileText },
  { label: 'Leads', href: '/leads', icon: UserPlus },
  { label: 'Newsletter', href: '/newsletter', icon: Mail },
  { label: 'Partnerships', href: '/partnerships', icon: Briefcase },
]

export function Sidebar({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <aside className="a-side">
      <div className="a-side__brand">
        <NavLink to="/" className="a-side__logo">
          <img src={logo} alt="Mensa" width={92} />
        </NavLink>
        <span className="a-side__tag">Admin</span>
        <button type="button" className="a-side__close" onClick={onClose} aria-label="Close menu">
          <X />
        </button>
      </div>

      <nav className="a-side__nav" aria-label="Admin">
        {items.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/'}
            className={({ isActive }) => cn('a-navlink', isActive && 'is-active')}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="a-side__foot">
        <a
          href={buildAppUrl('platform')}
          target="_blank"
          rel="noreferrer"
          className="a-navlink a-navlink--quiet"
        >
          <ExternalLink />
          <span>View storefront</span>
        </a>
        {user ? (
          <div className="a-me">
            <Avatar name={user.name} size={34} />
            <div className="a-me__text">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <NavLink to="/profile" className="a-iconbtn" aria-label="Profile" title="Profile">
              <Settings />
            </NavLink>
            <button
              type="button"
              className="a-iconbtn"
              onClick={() => logout.mutate()}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
