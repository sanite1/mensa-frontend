// ProductCard: the design system's shop tile. A second photo crossfades in on
// hover, and single variant products add straight to the bag.
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useFormatPrice } from '@/lib/currency'
import type { Product, ProductVariant } from '@/lib/network/types/product.types'

/** What a shopper pays for a variant, sale price included. */
export function variantPrice(product: Product, v?: ProductVariant): number {
  if (v?.b2cPriceOverride != null) return v.b2cPriceOverride
  return product.salePrice ?? product.basePriceB2C
}

/** Lowest and highest price across the active variants. */
export function priceRange(product: Product): { min: number; max: number } {
  const variants = (product.variants ?? []).filter((v) => v.isActive !== false)
  const prices = variants.length
    ? variants.map((v) => variantPrice(product, v))
    : [variantPrice(product)]
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function sizesOf(product: Product): string[] {
  const key = (product.optionTypes ?? []).find((t) => t.toLowerCase() === 'size')
  if (!key) return []
  return [...new Set((product.variants ?? []).map((v) => v.options?.[key]).filter(Boolean))]
}

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const formatPrice = useFormatPrice()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openDrawer)

  const photos = [...(p.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const variants = (p.variants ?? []).filter((v) => v.isActive !== false)
  const inStock = !p.isSoldOut && variants.some((v) => v.stockCount > 0)
  const single = variants.length === 1 ? variants[0] : null
  const sizes = sizesOf(p)
  const sizeKey = (p.optionTypes ?? []).find((t) => t.toLowerCase() === 'size')
  const { min, max } = priceRange(p)
  const onSale = p.salePrice != null && p.salePrice < p.basePriceB2C
  const off = onSale ? Math.round((1 - (p.salePrice ?? 0) / p.basePriceB2C) * 100) : 0
  const fewLeft =
    inStock &&
    variants
      .filter((v) => v.stockCount > 0)
      .every((v) => v.stockCount <= (v.lowStockThreshold || 5))
  const optionName = (p.optionTypes?.[0] ?? 'option').toLowerCase()

  const addSingle = () => {
    if (!single) return
    addItem({
      productId: p.id,
      variantId: single._id,
      productName: p.name,
      variantLabel: p.name,
      unitPrice: variantPrice(p, single),
      slug: p.slug,
      imageUrl: photos[0]?.url,
    })
    openCart()
    toast.success(`${p.name} added to bag.`)
  }

  return (
    <article
      className={`pcard${inStock ? '' : ' is-soldout'}${photos.length > 1 ? ' has-alt' : ''}`}
      style={{ '--d': `${Math.min(index, 8) * 0.06}s` } as CSSProperties}
    >
      <div className="pcard__frame">
        <Link to={`/shop/${p.slug}`} className="pcard__media" aria-label={p.name}>
          {photos[0] ? (
            <img src={photos[0].url} alt={photos[0].alt || p.name} loading="lazy" />
          ) : null}
          {photos[1] ? (
            <img src={photos[1].url} alt="" aria-hidden className="pcard__alt" loading="lazy" />
          ) : null}
          <span className="pcard__badges">
            {!inStock ? (
              <span className="pbadge pbadge--dark">Sold out</span>
            ) : p.metadata?.badge ? (
              <span className="pbadge">{p.metadata.badge}</span>
            ) : null}
            {off > 0 && inStock ? <span className="pbadge pbadge--rose">Save {off}%</span> : null}
          </span>
        </Link>
        {inStock ? (
          single ? (
            <button type="button" className="pcard__add" onClick={addSingle}>
              <svg width="16" height="16">
                <use href="#i-bag" />
              </svg>{' '}
              Add to bag
            </button>
          ) : (
            <Link className="pcard__add" to={`/shop/${p.slug}`}>
              Choose {sizes.length ? 'size' : optionName}{' '}
              <svg className="arrow" width="16" height="16">
                <use href="#i-arrow" />
              </svg>
            </Link>
          )
        ) : null}
      </div>
      <div className="pcard__body">
        <div className="pcard__row">
          <h3>
            <Link to={`/shop/${p.slug}`}>{p.name}</Link>
          </h3>
          <span className="pcard__price">
            {min !== max ? <small>From </small> : null}
            {formatPrice(min)}
            {onSale ? <s>{formatPrice(p.basePriceB2C)}</s> : null}
          </span>
        </div>
        <p>
          {p.subheading || p.shortDescription}
          {fewLeft ? <em> · Only a few left</em> : null}
        </p>
        {sizes.length > 1 && sizeKey ? (
          <ul className="pcard__sizes" aria-label="Sizes">
            {sizes.map((s) => {
              const any = variants.some((v) => v.options?.[sizeKey] === s && v.stockCount > 0)
              return (
                <li key={s} className={any ? '' : 'is-out'} title={any ? s : `${s} sold out`}>
                  {s}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </article>
  )
}
