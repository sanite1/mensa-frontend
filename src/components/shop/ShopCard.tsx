// ─────────────────────────────────────────────────────────────────────────
// ShopCard — product tile used in the Shop grid.
//
//   [ image (4:5) with optional pill badge top-left ]
//   [ italic Newsreader name, 2 lines max ]
//   [ price (with optional strikethrough old price + save chip) ]
//   [ mono caps subheading as a tag ]
//   [ stars + rating, only when metadata.rating present ]
//
// Stack layout (no side-by-side name/price) so long names like "Reusable
// Pads, Pack of 5, Heavy" never crowd the price column. Subheading sits at
// the bottom like a quiet category tag.
// ─────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatNaira } from '@/lib/utils'
import type { Product } from '@/lib/network/types/product.types'
import { Photo } from './Photo'
import { Stars } from './Stars'

interface ShopCardProps {
  product: Product
}

// Badge tone is a runtime prop (pink / coral / ink). Map to a Tailwind
// class so the component stays inline-style-free.
const BADGE_TONE_CLASS: Record<string, string> = {
  pink: 'bg-pink',
  coral: 'bg-coral',
  ink: 'bg-ink',
}

export function ShopCard({ product }: ShopCardProps) {
  const images = product.images ?? []
  const metadata = product.metadata ?? {}
  const heroImage = images.find((img) => img.order === 0) ?? images[0]
  const price = product.salePrice ?? product.basePriceB2C
  const hasSale = product.salePrice != null && product.salePrice < product.basePriceB2C
  const savings = hasSale ? product.basePriceB2C - (product.salePrice ?? 0) : 0

  const isSoldOut = product.isSoldOut
  const badgeToneClass = BADGE_TONE_CLASS[metadata.badgeTone ?? 'pink'] ?? 'bg-pink'

  return (
    <Link to={`/shop/${product.slug}`} className="group flex flex-col no-underline text-ink gap-3">
      {/* Image + badge */}
      <div className="relative overflow-hidden">
        <div
          className={cn(
            'transition-transform duration-500 ease-out group-hover:scale-[1.03]',
            isSoldOut && 'grayscale-[0.6] opacity-65',
          )}
        >
          <Photo
            src={heroImage?.url}
            alt={heroImage?.alt ?? product.name}
            tone="blush"
            ratio="4/5"
          />
        </div>
        {metadata.badge && !isSoldOut ? (
          <span
            className={cn(
              'absolute top-3 left-3 font-sans uppercase px-2.5 py-1.25 text-white text-[10.5px] font-medium tracking-[0.08em] rounded-full',
              badgeToneClass,
            )}
          >
            {metadata.badge}
          </span>
        ) : null}
        {isSoldOut ? (
          <span className="absolute top-3 left-3 font-sans uppercase px-2.5 py-1.25 bg-ink text-white text-[10.5px] font-medium tracking-[0.08em] rounded-full">
            Sold out
          </span>
        ) : null}
      </div>

      {/* Meta column */}
      <div className="flex flex-col gap-1.5">
        {/* Name — clamped to 2 lines so long names don't unbalance the grid. */}
        <h3 className="m-0 font-display italic font-semibold text-[clamp(17px,1.5vw,22px)] leading-[1.08] tracking-[-0.015em] text-ink line-clamp-2">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-sans text-ink font-semibold text-[clamp(13.5px,1.1vw,15px)] leading-none">
            {formatNaira(price)}
          </span>
          {hasSale ? (
            <>
              <span className="font-sans text-mute text-[clamp(11.5px,1vw,13px)] line-through leading-none">
                {formatNaira(product.basePriceB2C)}
              </span>
              <span className="font-sans bg-blush text-berry px-1.5 py-0.5 text-[10px] font-medium tracking-[0.04em] rounded-[3px]">
                Save {formatNaira(savings)}
              </span>
            </>
          ) : null}
        </div>

        {/* Subheading tag — single line, truncate with ellipsis. */}
        {product.subheading ? (
          <div className="font-mono uppercase mt-0.5 text-[10px] tracking-widest text-mute whitespace-nowrap overflow-hidden text-ellipsis">
            {product.subheading}
          </div>
        ) : null}

        {/* Rating row (only when present) */}
        {typeof metadata.rating === 'number' ? (
          <div className={cn('flex items-center gap-1.5', product.subheading ? 'mt-0.5' : 'mt-1')}>
            <Stars value={metadata.rating} size={11} />
            <span className="font-sans text-graphite text-[12px]">
              {metadata.rating.toFixed(1)}
              {metadata.reviewCount != null ? (
                <span className="text-mute"> ({metadata.reviewCount})</span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}
