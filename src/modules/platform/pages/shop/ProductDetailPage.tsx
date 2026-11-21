// /shop/:slug: the design system's product page. Sticky gallery on the left,
// buy box and accordions on the right, related products below. Our extras:
// any number of admin option types, admin trust lines and accordions, the
// rating line, and a sticky Add to bag bar on phones.
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useProduct, useProducts } from '@/lib/network/api/product.api'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useFormatPrice } from '@/lib/currency'
import { Stars } from '@/components/shop/Stars'
import { SizeGuideDialog } from '@/components/shop/SizeGuideDialog'
import { useSeo } from '@/lib/seo'
import { Gallery } from '@/modules/platform/components/shop/Gallery'
import { ProductCard, variantPrice } from '@/modules/platform/components/shop/ProductCard'
import type { Product, ProductVariant, TrustIcon } from '@/lib/network/types/product.types'

const CATEGORY_LABEL: Record<Product['category'], string> = {
  pants: 'Period pants',
  pads: 'Reusable pads',
  bundles: 'Bundles',
  education: 'Education',
  advocacy: 'Advocacy',
}

const WEARABLE: Product['category'][] = ['pants', 'pads', 'bundles']

const ICONS: Record<TrustIcon, ReactNode> = {
  truck: (
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM17 19.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z" />
  ),
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3ZM9 12l2 2 4-4" />,
  leaf: <path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19 14 10" />,
  star: <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  check: <path d="m5 12 5 5 9-10" />,
}

function Icon({ name }: { name: TrustIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      {ICONS[name] ?? ICONS.check}
    </svg>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const productQuery = useProduct(slug)

  if (productQuery.isLoading) return <LoadingState />
  if (productQuery.isError || !productQuery.data?.data) return <NotFoundState />

  const product = productQuery.data.data.product
  // Keyed so the option state resets when moving between products.
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product: p }: { product: Product }) {
  const formatPrice = useFormatPrice()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openDrawer)

  const variants = useMemo(() => (p.variants ?? []).filter((v) => v.isActive !== false), [p])
  const images = useMemo(
    () => [...(p.images ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [p],
  )
  const optionTypes = p.optionTypes ?? []
  const metadata = p.metadata ?? {}
  const inStock = (v?: ProductVariant | null) => !p.isSoldOut && !!v && v.stockCount > 0

  const description =
    p.shortDescription || p.subheading || `${p.name}, reusable period products made in Abuja.`
  useSeo({
    title: p.name,
    description,
    image: images[0]?.url,
    type: 'product',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description,
        image: images.map((img) => img.url).filter(Boolean),
        sku: p.slug,
        brand: { '@type': 'Brand', name: 'Mensa Period Products' },
        offers: variants.map((v) => ({
          '@type': 'Offer',
          sku: v.sku,
          url: `https://mensaproducts.com/shop/${p.slug}`,
          // Schema.org price is in the main currency unit, the catalogue stores kobo.
          price: (variantPrice(p, v) / 100).toFixed(2),
          priceCurrency: 'NGN',
          availability: inStock(v) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Shop',
            item: 'https://mensaproducts.com/shop',
          },
          { '@type': 'ListItem', position: 2, name: p.name },
        ],
      },
    ],
  })

  // Start on the first in stock choice.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const seed = variants.find((v) => inStock(v)) ?? variants[0]
    return Object.fromEntries(optionTypes.map((t) => [t, seed?.options?.[t] ?? '']))
  })
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const match = (opts: Record<string, string>) =>
    variants.find((v) => optionTypes.every((t) => (v.options?.[t] ?? '') === (opts[t] ?? '')))
  const variant = optionTypes.length ? (match(selected) ?? null) : (variants[0] ?? null)
  const price = variantPrice(p, variant ?? undefined)
  const onSale = p.salePrice != null && p.salePrice < p.basePriceB2C
  const compareAt = onSale && variant?.b2cPriceOverride == null ? p.basePriceB2C : null
  const off = compareAt ? Math.round((1 - price / compareAt) * 100) : 0
  const available = inStock(variant)
  const fewLeft = available && variant!.stockCount <= (variant!.lowStockThreshold || 5)
  const label = variant
    ? optionTypes
        .map((t) => variant.options?.[t])
        .filter(Boolean)
        .join(' · ')
    : ''

  const valuesOf = (type: string) => [
    ...new Set(variants.map((v) => v.options?.[type]).filter((x): x is string => !!x)),
  ]
  // A chip is live when picking it, with the other current choices, lands on stock.
  const chipInStock = (type: string, value: string) =>
    inStock(match({ ...selected, [type]: value })) ||
    variants.some((v) => v.options?.[type] === value && inStock(v))

  const addToBag = () => {
    if (!variant || !available) return
    addItem({
      productId: p.id,
      variantId: variant._id,
      productName: p.name,
      variantLabel: label || p.name,
      unitPrice: price,
      qty,
      slug: p.slug,
      imageUrl: images[0]?.url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    openCart()
    toast.success(`${p.name} added to bag.`)
  }

  const buttonText = !variant
    ? 'Choose an option'
    : !available
      ? 'Sold out'
      : added
        ? 'Added to bag ✓'
        : `Add to bag · ${formatPrice(price * qty)}`

  const accordions = (p.accordions ?? []).filter((a) => a.heading && a.body)
  const hasCare = accordions.some((a) => /care|wash/i.test(a.heading))
  const hasShipping = accordions.some((a) => /ship|deliver|return/i.test(a.heading))
  const trust = p.trustLines?.length
    ? p.trustLines
    : [
        {
          _id: 'd',
          icon: 'truck' as const,
          text: 'Delivery across Nigeria from our studio in Abuja.',
        },
        {
          _id: 'p',
          icon: 'shield' as const,
          text: 'Secure checkout with Paystack: card, bank transfer or USSD.',
        },
      ]

  return (
    <main className="pdp pb-24 md:pb-8">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          <span aria-hidden>/</span>
          <Link to={`/shop?category=${p.category}`}>{CATEGORY_LABEL[p.category]}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{p.name}</span>
        </nav>

        <div className="pdp__grid">
          <div className="pdp__media">
            <Gallery
              images={images}
              alt={p.name}
              badge={p.isSoldOut ? 'Sold out' : metadata.badge}
            />
          </div>

          <div className="pdp__info">
            <span className="eyebrow">{CATEGORY_LABEL[p.category]}</span>
            <div className="pdp__title">
              <h1>{p.name}</h1>
              {p.subheading ? <p className="pdp__sub">{p.subheading}</p> : null}
              {typeof metadata.rating === 'number' ? (
                <div className="inline-flex items-center gap-1.5 mt-2">
                  <Stars value={metadata.rating} size={13} />
                  <span className="text-[13px] text-mute">
                    {metadata.rating.toFixed(1)}
                    {metadata.reviewCount != null ? <> ({metadata.reviewCount} reviews)</> : null}
                  </span>
                </div>
              ) : null}
            </div>
            {p.shortDescription ? <p className="pdp__desc">{p.shortDescription}</p> : null}

            <div className="buy">
              <div className="buy__price" aria-live="polite">
                <b>{formatPrice(price)}</b>
                {compareAt ? (
                  <>
                    <s>{formatPrice(compareAt)}</s>
                    <span className="pbadge pbadge--rose">Save {off}%</span>
                  </>
                ) : null}
              </div>

              {optionTypes.map((type) => {
                const isSize = type.toLowerCase() === 'size'
                return (
                  <fieldset className="opt" key={type}>
                    <legend>
                      {type}
                      <span>{selected[type]}</span>
                      {isSize && p.showSizeGuide ? (
                        <SizeGuideDialog>
                          <button type="button" className="opt__guide">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.7}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              width="16"
                              height="16"
                              aria-hidden
                            >
                              <rect x="2" y="8" width="20" height="8" rx="2" />
                              <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
                            </svg>
                            Size guide
                          </button>
                        </SizeGuideDialog>
                      ) : null}
                    </legend>
                    <div className="opt__list">
                      {valuesOf(type).map((value) => {
                        const live = chipInStock(type, value)
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`chip${isSize ? ' chip--size' : ''}${selected[type] === value ? ' is-on' : ''}${live ? '' : ' is-out'}`}
                            aria-pressed={selected[type] === value}
                            title={live ? value : `${value}: sold out`}
                            onClick={() => setSelected((s) => ({ ...s, [type]: value }))}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                    {isSize ? (
                      <p className="opt__hint">
                        Between two sizes? Size up: it should feel like a hug, not a squeeze.
                      </p>
                    ) : null}
                  </fieldset>
                )
              })}

              <div className="buy__row">
                <div className="qty" aria-label="Quantity">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="One less"
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    aria-label="One more"
                    disabled={qty >= 20}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className={`btn buy__add${added ? ' is-added' : ''}`}
                  onClick={addToBag}
                  disabled={!available}
                >
                  {buttonText}
                </button>
              </div>
              {fewLeft ? (
                <p className="buy__few">
                  <span /> Only {variant!.stockCount} left{label ? ` in ${label}` : ''}
                </p>
              ) : null}
              {variant && !available ? (
                <p className="buy__few buy__few--out">
                  This one is sold out. We restock every few weeks, so try another option or{' '}
                  <Link to="/contact">ask us</Link> to hear first.
                </p>
              ) : null}
            </div>

            <ul className="pdp__trust">
              {trust.map((t) => (
                <li key={t._id}>
                  <Icon name={t.icon} />
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>

            <div className="pdp__acc">
              {p.description?.trim() ? (
                <details open>
                  <summary>Description</summary>
                  <div className="whitespace-pre-line">{p.description}</div>
                </details>
              ) : null}
              {accordions.map((a, i) => (
                <details key={a._id ?? i} open={!p.description?.trim() && i === 0}>
                  <summary>{a.heading}</summary>
                  <div className="whitespace-pre-line">{a.body}</div>
                </details>
              ))}
              {!hasCare && WEARABLE.includes(p.category) ? (
                <details>
                  <summary>Care</summary>
                  <div>
                    <ol className="pdp__care">
                      <li>Rinse in cold water straight after wearing.</li>
                      <li>Wash cold, or by hand with a neutral detergent.</li>
                      <li>Hang to dry.</li>
                    </ol>
                    <p>No bleach or fabric softener.</p>
                  </div>
                </details>
              ) : null}
              {!hasShipping ? (
                <details>
                  <summary>Delivery and returns</summary>
                  <div>
                    <p>
                      We deliver across Nigeria from Abuja. Delivery options and fees show at
                      checkout once you enter your address. Something not right when it arrives?{' '}
                      <Link to="/returns">See delivery and returns</Link>.
                    </p>
                  </div>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Related product={p} />

      {/* Our extra: a sticky Add to bag bar on phones, styled in the design's tokens. */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-(--line) bg-(--paper) px-4 py-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] text-(--mute)">
            {p.name}
            {label ? ` · ${label}` : ''}
          </span>
          <span className="text-[15px] font-semibold text-(--ink)">{formatPrice(price)}</span>
        </div>
        <button type="button" className="btn" onClick={addToBag} disabled={!available}>
          {!variant ? 'Choose an option' : available ? 'Add to bag' : 'Sold out'}
        </button>
      </div>
    </main>
  )
}

/** Same category first, topped up from the rest of the shop. */
function Related({ product }: { product: Product }) {
  const { data } = useProducts()
  const items = data?.data?.items ?? []
  const others = items.filter((x) => x.id !== product.id && !x.isSoldOut)
  const related = [
    ...others.filter((x) => x.category === product.category),
    ...others.filter((x) => x.category !== product.category),
  ].slice(0, 4)
  if (!related.length) return null

  return (
    <section className="section pdp__related">
      <div className="wrap">
        <div className="section__head">
          <div>
            <span className="eyebrow">Pairs well with</span>
            <h2>Complete your kit.</h2>
          </div>
          <Link className="btn btn--ghost" to="/shop">
            Shop everything{' '}
            <svg className="arrow" width="18" height="18">
              <use href="#i-arrow" />
            </svg>
          </Link>
        </div>
        <div className="shop-grid shop-grid--4">
          {related.map((r, i) => (
            <ProductCard key={r.id} product={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <main className="pdp">
      <div className="wrap">
        <div className="crumbs">&nbsp;</div>
        <div className="pdp__grid">
          <div className="aspect-4/5 w-full animate-pulse rounded-(--r-md) bg-(--blush)" />
          <div className="flex flex-col gap-4">
            <div className="h-3 w-32 animate-pulse bg-(--blush)" />
            <div className="h-12 w-3/4 animate-pulse bg-(--blush)" />
            <div className="h-3 w-1/2 animate-pulse bg-(--blush)" />
            <div className="mt-4 h-8 w-32 animate-pulse bg-(--blush)" />
          </div>
        </div>
      </div>
    </main>
  )
}

function NotFoundState() {
  return (
    <main className="pdp">
      <div className="wrap">
        <div className="shop-empty">
          <span className="eyebrow">Not found</span>
          <h2>We can't find that one.</h2>
          <p>It may have been archived or moved. Everything else is still in the shop.</p>
          <Link className="btn" to="/shop">
            Back to the shop
          </Link>
        </div>
      </div>
    </main>
  )
}
