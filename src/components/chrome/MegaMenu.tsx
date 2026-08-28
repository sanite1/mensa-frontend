// MegaMenu — desktop Shop dropdown. Product links are driven by the live catalogue via useProducts so the menu matches what is for sale.
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from './icons'
import { useProducts } from '@/lib/network/api/product.api'
import { useFormatPrice } from '@/lib/currency'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import reusablePadPreview from '@/assets/reuseable-pad.jpg'

interface MegaMenuLink {
  label: string
  hint?: string
  href: string
}

function useCategoryLinks(
  products: Product[],
  category: ProductCategory,
  seeAllLabel: string,
  max = 4,
): MegaMenuLink[] {
  const formatPrice = useFormatPrice()
  const items = products
    .filter((p) => p.category === category)
    .slice(0, max)
    .map((p) => ({
      label: p.name,
      hint: formatPrice(p.basePriceB2C),
      href: `/shop/${p.slug}`,
    }))
  if (items.length === 0) return []
  return [...items, { label: seeAllLabel, href: `/shop?category=${category}` }]
}

function Column({
  title,
  links,
  onLinkClick,
}: {
  title: string
  links: MegaMenuLink[]
  onLinkClick?: () => void
}) {
  if (links.length === 0) return null
  return (
    <div>
      <div className="t-eyebrow mb-4.5 text-(--mute)">{title}</div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {links.map((link) => (
          <li key={link.href}>
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
  // One catalogue fetch drives every column and the feature card, cached by TanStack Query.
  const query = useProducts({ pageSize: 60, sort: 'featured' })
  const products: Product[] = query.data?.data?.items ?? []
  const formatPrice = useFormatPrice()

  const periodPants = useCategoryLinks(products, 'pants', 'See all pants')
  const reusablePads = useCategoryLinks(products, 'pads', 'See all pads')
  const education = useCategoryLinks(products, 'education', 'See all education')

  // Feature card — prefer the specific "starter-set" slug, fall back to
  // the first bundle in the catalogue.
  const featured =
    products.find((p) => p.slug === 'starter-set') ?? products.find((p) => p.category === 'bundles')

  return (
    <div className="grid bg-paper border-t border-hairline-soft pt-10 px-12 pb-11 grid-cols-[1.2fr_1.2fr_1.2fr_1.6fr] gap-12">
      <Column title="Period pants" links={periodPants} onLinkClick={onLinkClick} />
      <Column title="Reusable pads" links={reusablePads} onLinkClick={onLinkClick} />
      <Column title="Education" links={education} onLinkClick={onLinkClick} />

      {/* Feature card from the real bundle product, hidden when the catalogue has none. */}
      {featured ? (
        <div className="relative overflow-hidden bg-blush rounded-lg p-6">
          <div className="t-eyebrow text-berry">New this season</div>
          <h3 className="mt-2 text-berry font-display italic font-semibold text-[30px] leading-[1.1] tracking-[-0.015em]">
            {featured.name}
          </h3>
          {featured.shortDescription ? (
            <p className="mt-2 text-[14px] max-w-55 text-graphite">{featured.shortDescription}</p>
          ) : null}
          <div className="mt-4.5 relative z-10">
            <Button asChild variant="primary" size="sm">
              <Link to={`/shop/${featured.slug}`} onClick={onLinkClick}>
                Shop the set · {formatPrice(featured.basePriceB2C)}
                <IconArrowRight size={14} />
              </Link>
            </Button>
          </div>
          {/* Product preview — reusable pad photo in the corner frame the
              old stripe placeholder used to occupy. */}
          <div className="absolute -right-7.5 -top-2.5 w-35 h-45 rounded-md overflow-hidden bg-blush-stripe">
            <img
              src={reusablePadPreview}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
