// Re-exports lucide icons under the names used in the design files, all with strokeWidth 1.6 to match the brief.
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
  Instagram,
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
export const IconInstagram = (p: LucideProps) => <Instagram {...defaults} {...p} />

// Lucide does not ship a TikTok glyph yet, so we inline the official mark.
export const IconTikTok = ({ size = 18, ...rest }: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...rest}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.14V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.23z" />
  </svg>
)
