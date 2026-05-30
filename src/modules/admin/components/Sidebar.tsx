// ─────────────────────────────────────────────────────────────────────────
// Admin sidebar — dark ink rail with section links.
//
//   ≥ lg : permanently visible to the left of the main content
//   < lg : hidden; rendered as a slide-in drawer with overlay when isOpen
//
// Active state uses a pink left border + paper text.
// ─────────────────────────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  FileText,
  Briefcase,
  X,
  type LucideIcon,
} from 'lucide-react'
import { MensaWordmark } from '@/components/chrome/MensaWordmark'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** When true the link is rendered but disabled (Sprint not yet shipped). */
  comingSoon?: boolean
}

const items: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Customers', href: '/customers', icon: Users, comingSoon: true },
  { label: 'Discounts', href: '/discounts', icon: Tag },
  { label: 'Content', href: '/content', icon: FileText, comingSoon: true },
  { label: 'Partnerships', href: '/partnerships', icon: Briefcase, comingSoon: true },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay — mobile only */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Desktop: in-flow, fixed width, always visible
          'lg:static lg:translate-x-0 lg:z-auto lg:flex',
          // Mobile: fixed position, slide in from left, drawer behaviour
          'fixed inset-y-0 left-0 z-50 w-65 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Shared styling
          'shrink-0 bg-ink text-paper flex flex-col border-r border-white/10',
        )}
      >
        <div className="h-17 flex items-center justify-between px-6 border-b border-white/10">
          <MensaWordmark height={28} tone="paper" />
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center text-paper hover:bg-white/10"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon
            if (item.comingSoon) {
              return (
                <div
                  key={item.label}
                  className="px-6 py-3 flex items-center gap-3 text-white/35 cursor-not-allowed select-none text-[14px]"
                  title="Available in a later sprint"
                >
                  <Icon size={18} strokeWidth={1.6} />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-white/35 font-mono">
                    Soon
                  </span>
                </div>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={item.href}
                end
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'px-6 py-3 flex items-center gap-3 text-[14px] transition-colors border-l-2 no-underline',
                    isActive
                      ? 'border-pink text-paper bg-white/5'
                      : 'border-transparent text-white/70 hover:text-paper hover:bg-white/5',
                  )
                }
              >
                <Icon size={18} strokeWidth={1.6} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="text-[10px] uppercase tracking-[0.12em] text-white/45 font-mono">
            Mensa admin · v0.1
          </div>
        </div>
      </aside>
    </>
  )
}
