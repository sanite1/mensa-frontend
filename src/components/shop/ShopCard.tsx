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

const BADGE_BG: Record<string, string> = {
  pink: 'var(--pink)',
  coral: 'var(--coral)',
  ink: 'var(--ink)',
}

export function ShopCard({ product }: ShopCardProps) {
  const images = product.images ?? []
  const metadata = product.metadata ?? {}
  const heroImage = images.find((img) => img.order === 0) ?? images[0]
  const price = product.salePrice ?? product.basePriceB2C
  const hasSale =
    product.salePrice != null && product.salePrice < product.basePriceB2C
  const savings = hasSale ? product.basePriceB2C - (product.salePrice ?? 0) : 0

  const isSoldOut = product.isSoldOut

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group flex flex-col no-underline text-[var(--ink)] gap-3"
    >
      {/* Image + badge */}
      <div className="relative overflow-hidden">
        <div
          className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={isSoldOut ? { filter: 'grayscale(0.6)', opacity: 0.65 } : undefined}
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
            className="absolute font-sans uppercase"
            style={{
              top: 12,
              left: 12,
              padding: '5px 10px',
              background: BADGE_BG[metadata.badgeTone ?? 'pink'] ?? 'var(--pink)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: '0.08em',
              borderRadius: 999,
            }}
          >
            {metadata.badge}
          </span>
        ) : null}
        {isSoldOut ? (
          <span
            className="absolute font-sans uppercase"
            style={{
              top: 12,
              left: 12,
              padding: '5px 10px',
              background: 'var(--ink)',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: '0.08em',
              borderRadius: 999,
            }}
          >
            Sold out
          </span>
        ) : null}
      </div>

      {/* Meta column */}
      <div className="flex flex-col gap-1.5">
        {/* Name */}
        <h3
          className="m-0"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 'clamp(17px, 1.5vw, 22px)',
            lineHeight: 1.08,
            letterSpacing: '-0.015em',
            color: 'var(--ink)',
            // Clamp to 2 lines so long names don't unbalance the grid.
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-sans"
            style={{
              color: 'var(--ink)',
              fontWeight: 600,
              fontSize: 'clamp(13.5px, 1.1vw, 15px)',
              lineHeight: 1,
            }}
          >
            {formatNaira(price)}
          </span>
          {hasSale ? (
            <>
              <span
                className="font-sans"
                style={{
                  color: 'var(--mute)',
                  fontSize: 'clamp(11.5px, 1vw, 13px)',
                  textDecoration: 'line-through',
                  lineHeight: 1,
                }}
              >
                {formatNaira(product.basePriceB2C)}
              </span>
              <span
                className="font-sans"
                style={{
                  background: 'var(--blush)',
                  color: 'var(--berry)',
                  padding: '2px 6px',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  borderRadius: 3,
                }}
              >
                Save {formatNaira(savings)}
              </span>
            </>
          ) : null}
        </div>

        {/* Subheading tag */}
        {product.subheading ? (
          <div
            className="font-mono uppercase mt-0.5"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--mute)',
              // Single line, truncate with ellipsis.
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.subheading}
          </div>
        ) : null}

        {/* Rating row (only when present) */}
        {typeof metadata.rating === 'number' ? (
          <div
            className={cn(
              'flex items-center gap-1.5',
              product.subheading ? 'mt-0.5' : 'mt-1',
            )}
          >
            <Stars value={metadata.rating} size={11} />
            <span
              className="font-sans text-[var(--graphite)]"
              style={{ fontSize: 12 }}
            >
              {metadata.rating.toFixed(1)}
              {metadata.reviewCount != null ? (
                <span className="text-[var(--mute)]"> ({metadata.reviewCount})</span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}
