// ─────────────────────────────────────────────────────────────────────────
// Re-export of lucide icons under the names used in the design files, so
// chrome / page code reads the same as the source JSX. All icons inherit
// strokeWidth=1.6 to match the hand-drawn feel from the brief.
// ─────────────────────────────────────────────────────────────────────────
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Truck,
  Leaf,
  Shield,
  Star,
  Check,
  type LucideProps,
} from 'lucide-react'

const defaults: LucideProps = { strokeWidth: 1.6 }

export const IconSearch = (p: LucideProps) => <Search {...defaults} {...p} />
export const IconUser = (p: LucideProps) => <User {...defaults} {...p} />
export const IconBag = (p: LucideProps) => <ShoppingBag {...defaults} {...p} />
export const IconMenu = (p: LucideProps) => <Menu {...defaults} {...p} />
export const IconClose = (p: LucideProps) => <X {...defaults} {...p} />
export const IconChevronDown = (p: LucideProps) => <ChevronDown {...defaults} {...p} />
export const IconChevronRight = (p: LucideProps) => <ChevronRight {...defaults} {...p} />
export const IconArrowRight = (p: LucideProps) => <ArrowRight {...defaults} {...p} />
export const IconArrowUpRight = (p: LucideProps) => <ArrowUpRight {...defaults} {...p} />
export const IconPhone = (p: LucideProps) => <Phone {...defaults} {...p} />
export const IconMail = (p: LucideProps) => <Mail {...defaults} {...p} />
export const IconPin = (p: LucideProps) => <MapPin {...defaults} {...p} />
export const IconTruck = (p: LucideProps) => <Truck {...defaults} {...p} />
export const IconLeaf = (p: LucideProps) => <Leaf {...defaults} {...p} />
export const IconShield = (p: LucideProps) => <Shield {...defaults} {...p} />
export const IconStar = (p: LucideProps) => <Star {...defaults} {...p} />
export const IconCheck = (p: LucideProps) => <Check {...defaults} {...p} />
