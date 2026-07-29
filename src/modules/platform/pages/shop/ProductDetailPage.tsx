// ═══════════════════════════════════════════════════════════════
// /shop/:slug — Product Detail Page.
//
// Layout:
//   Desktop (lg) — two column hero: gallery left, info right.
//   Tablet  (md) — stacked: gallery on top, info below.
//   Mobile  (sm) — stacked + sticky Add to bag at the bottom.
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useProduct } from '@/lib/network/api/product.api'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useFormatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Gallery } from '@/components/shop/Gallery'
import { OptionPicker } from '@/components/shop/OptionPicker'
import { Stars } from '@/components/shop/Stars'
import { TrustLine } from '@/components/shop/TrustLine'
import { SizeGuideDialog } from '@/components/shop/SizeGuideDialog'
import { useSeo } from '@/lib/seo'
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconLeaf,
  IconMail,
  IconShield,
  IconStar,
  IconTruck,
} from '@/components/chrome/icons'
import type { Product, ProductVariant, TrustIcon } from '@/lib/network/types/product.types'
import type { ComponentType } from 'react'

// Map of icon shorthand to the corresponding Mensa icon component.
const TRUST_ICONS: Record<TrustIcon, ComponentType<{ size?: number }>> = {
  truck: IconTruck,
  shield: IconShield,
  leaf: IconLeaf,
  star: IconStar,
  check: IconCheck,
  mail: IconMail,
}

// Category label used in eyebrow + breadcrumb.
const CATEGORY_LABEL: Record<Product['category'], string> = {
  pants: 'Period pants',
  pads: 'Reusable pads',
  bundles: 'Bundles',
  education: 'Education',
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const productQuery = useProduct(slug)

  if (productQuery.isLoading) return <LoadingState />
  if (productQuery.isError || !productQuery.data?.data) return <NotFoundState />

  const product = productQuery.data.data.product
  return <ProductView product={product} />
}

// ─────────────────────────────────────────────────────────────────
function ProductView({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)

  // Defensive defaults so a malformed response can't crash the render.
  const variants = product.variants ?? []
  const images = product.images ?? []
  const metadata = product.metadata ?? {}
  const optionTypes = product.optionTypes ?? []

  // SEO — use the hero image if we have one, otherwise the brand
  // default falls through from the index.html default. (heroImage
  // itself is declared further down for the rest of the view.)
  const seoHeroUrl = (images.find((img) => img.order === 0) ?? images[0])?.url
  useSeo({
    title: product.name,
    description:
      product.shortDescription ||
      product.subheading ||
      `${product.name} — reusable period products designed in Abuja.`,
    image: seoHeroUrl,
    type: 'product',
  })

  // Default selection: pull options from the first in stock variant.
  const defaultOptions = useMemo(() => {
    const seed: Record<string, string> = {}
    const seedVariant = variants.find((v) => v.isActive && v.stockCount > 0) ?? variants[0] ?? null
    if (seedVariant) {
      for (const type of optionTypes) {
        seed[type] = seedVariant.options?.[type] ?? ''
      }
    }
    return seed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions)
  const [qty, setQty] = useState(1)

  // Resolve the current option selection to a specific variant.
  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (optionTypes.length === 0) return variants[0] ?? null
    return (
      variants.find((v) =>
        optionTypes.every((t) => (v.options?.[t] ?? '') === (selectedOptions[t] ?? '')),
      ) ?? null
    )
  }, [variants, optionTypes, selectedOptions])

  const effectivePrice = useMemo(() => {
    if (selectedVariant?.b2cPriceOverride != null) return selectedVariant.b2cPriceOverride
    return product.salePrice ?? product.basePriceB2C
  }, [selectedVariant, product])

  const hasSale = product.salePrice != null && product.salePrice < product.basePriceB2C
  const savings = hasSale ? product.basePriceB2C - (product.salePrice ?? 0) : 0

  // Admin-controlled sold-out override forces the storefront into the same
  // state as a true zero-stock variant, without touching inventory.
  const isOutOfStock = product.isSoldOut || !selectedVariant || selectedVariant.stockCount <= 0
  const isLowStock =
    !product.isSoldOut &&
    !!selectedVariant &&
    selectedVariant.stockCount > 0 &&
    selectedVariant.stockCount <= 5
  const heroImage = images.find((img) => img.order === 0) ?? images[0] ?? null

  const openCartDrawer = useCartStore((s) => s.openDrawer)

  const variantLabel = useMemo(() => {
    if (!selectedVariant || optionTypes.length === 0) return product.name
    return optionTypes
      .map((t) => selectedVariant.options?.[t])
      .filter(Boolean)
      .join(' · ')
  }, [selectedVariant, optionTypes, product.name])

  const onAddToBag = () => {
    if (!selectedVariant || isOutOfStock) return
    addItem({
      productId: product.id,
      variantId: selectedVariant._id,
      productName: product.name,
      variantLabel,
      unitPrice: effectivePrice,
      qty,
      slug: product.slug,
      imageUrl: heroImage?.url,
    })
    openCartDrawer()
    toast.success(`${product.name} added to bag.`)
  }

  const badge = metadata.badge
    ? { label: metadata.badge, tone: metadata.badgeTone ?? 'pink' }
    : null

  return (
    <div className="bg-(--paper) pb-24 md:pb-0">
      {/* Breadcrumb */}
      <nav className="border-b border-hairline-soft bg-paper font-sans py-3 px-5 text-[12px]">
        <div className="flex items-center gap-2.5 flex-wrap text-(--mute)">
          <Link to="/" className="text-inherit no-underline">
            Mensa
          </Link>
          <IconChevronRight size={11} />
          <Link to="/shop" className="text-inherit no-underline">
            Shop
          </Link>
          <IconChevronRight size={11} />
          <span className="text-(--ink)">{CATEGORY_LABEL[product.category]}</span>
          <IconChevronRight size={11} />
          <span className="text-(--ink)">{product.name}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-5 md:px-10 lg:px-16 py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-start">
          <Gallery images={images} productName={product.name} badge={badge} />

          {/* Info */}
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            selectedOptions={selectedOptions}
            onSelectOptions={setSelectedOptions}
            qty={qty}
            onQtyChange={setQty}
            effectivePrice={effectivePrice}
            hasSale={hasSale}
            savings={savings}
            isOutOfStock={isOutOfStock}
            isLowStock={!!isLowStock}
            onAddToBag={onAddToBag}
          />
        </div>
      </section>

      {/* Sticky add to bag on mobile only */}
      <StickyAddToBag
        product={product}
        selectedVariant={selectedVariant}
        effectivePrice={effectivePrice}
        isOutOfStock={isOutOfStock}
        onAddToBag={onAddToBag}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
interface ProductInfoProps {
  product: Product
  selectedVariant: ProductVariant | null
  selectedOptions: Record<string, string>
  onSelectOptions: (next: Record<string, string>) => void
  qty: number
  onQtyChange: (n: number) => void
  effectivePrice: number
  hasSale: boolean
  savings: number
  isOutOfStock: boolean
  isLowStock: boolean
  onAddToBag: () => void
}

function ProductInfo({
  product,
  selectedVariant,
  selectedOptions,
  onSelectOptions,
  qty,
  onQtyChange,
  effectivePrice,
  hasSale,
  savings,
  isOutOfStock,
  isLowStock,
  onAddToBag,
}: ProductInfoProps) {
  const metadata = product.metadata ?? {}
  const variants = product.variants ?? []
  const optionTypes = product.optionTypes ?? []
  const formatPrice = useFormatPrice()
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* Title block */}
      <div>
        <div className="t-eyebrow text-(--coral)">
          {CATEGORY_LABEL[product.category]}
          {metadata.badge ? <> · {metadata.badge}</> : null}
        </div>
        <h1 className="m-0 mt-2.5 font-display italic font-semibold text-[clamp(36px,5vw,56px)] leading-[0.98] tracking-tight text-ink">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-2.5 flex-wrap mt-1.5">
          {product.subheading ? (
            <span className="font-mono uppercase text-mute text-[12px] tracking-widest">
              {product.subheading}
            </span>
          ) : null}
          {typeof metadata.rating === 'number' ? (
            <>
              {product.subheading ? (
                <span className="rounded-full opacity-50 w-1 h-1 bg-mute" />
              ) : null}
              <div className="inline-flex items-center gap-1.5">
                <Stars value={metadata.rating} size={13} />
                <span className="text-[13px] text-(--graphite)">
                  {metadata.rating.toFixed(1)}
                  {metadata.reviewCount != null ? <> ({metadata.reviewCount} reviews)</> : null}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <div className="font-sans text-ink font-semibold text-[32px] leading-none">
          {formatPrice(effectivePrice)}
        </div>
        {hasSale ? (
          <>
            <div className="text-[16px] text-mute line-through">
              {formatPrice(product.basePriceB2C)}
            </div>
            <span className="font-sans px-2 py-0.5 rounded-sm bg-blush text-berry text-[11.5px] font-medium tracking-[0.04em]">
              Save {formatPrice(savings)}
            </span>
          </>
        ) : null}
      </div>

      {/* Description */}
      {product.shortDescription ? (
        <p className="t-body m-0 text-(--graphite)">{product.shortDescription}</p>
      ) : null}

      {/* Option picker (Size, Color, etc.) */}
      {optionTypes.length > 0 ? (
        <div>
          {product.showSizeGuide ? (
            <div className="flex items-baseline justify-end mb-3">
              <SizeGuideDialog>
                <button
                  type="button"
                  className="text-[13px] font-medium text-ink border-b border-ink pb-0.5 hover:text-pink-deep hover:border-pink-deep cursor-pointer bg-transparent"
                >
                  Size guide →
                </button>
              </SizeGuideDialog>
            </div>
          ) : null}
          <OptionPicker
            optionTypes={optionTypes}
            variants={variants}
            selectedOptions={selectedOptions}
            onChange={onSelectOptions}
          />
          {/* Stock note */}
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-2 mt-3 text-[13px] text-(--err)">
              <span className="rounded-full w-2 h-2 bg-err" />
              Out of stock. Try another option or come back soon.
            </div>
          ) : isLowStock ? (
            <div className="inline-flex items-center gap-2 mt-3 text-[13px] text-(--coral)">
              <span className="rounded-full w-2 h-2 bg-coral" />
              Only {selectedVariant?.stockCount} left.
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mt-3 text-[13px] text-(--ok)">
              <span className="rounded-full w-2 h-2 bg-ok" />
              In stock. Ships in 2 to 3 days.
            </div>
          )}
        </div>
      ) : (
        // Single variant — no picker, just show stock status.
        <div>
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-2 text-[13px] text-(--err)">
              <span className="rounded-full w-2 h-2 bg-err" />
              Out of stock.
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-[13px] text-(--ok)">
              <span className="rounded-full w-2 h-2 bg-ok" />
              In stock. Ships in 2 to 3 days.
            </div>
          )}
        </div>
      )}

      {/* Qty + CTA */}
      <div className="flex gap-2.5 items-stretch">
        <div className="inline-flex items-center bg-paper border border-hairline rounded-sm">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="w-11 h-12 text-[17px] text-(--ink) hover:bg-(--cream)"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-center text-ink min-w-8 text-[15px]">{qty}</span>
          <button
            type="button"
            onClick={() => onQtyChange(qty + 1)}
            className="w-11 h-12 text-[17px] text-(--ink) hover:bg-(--cream)"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={isOutOfStock || !selectedVariant}
          onClick={onAddToBag}
        >
          {isOutOfStock ? (
            'Out of stock'
          ) : (
            <>
              Add to bag · {formatPrice(effectivePrice * qty)}
              <IconArrowRight size={16} />
            </>
          )}
        </Button>
      </div>

      {/* Trust block — admin-authored per product via product.trustLines. */}
      {(() => {
        const trustLines = product.trustLines ?? []
        if (trustLines.length === 0) return null
        return (
          <div className="flex flex-col gap-2.5 pt-1.5">
            {trustLines.map((line) => {
              const Icon = TRUST_ICONS[line.icon] ?? IconCheck
              return (
                <TrustLine key={line._id} icon={<Icon size={16} />}>
                  {line.text}
                </TrustLine>
              )
            })}
          </div>
        )
      })()}

      {/* Accordions — fully admin authored */}
      {(() => {
        const accordions = product.accordions ?? []
        const hasDescription = !!product.description?.trim()
        if (accordions.length === 0 && !hasDescription) return null
        return (
          <div className="border-t border-(--hairline) mt-2">
            {hasDescription ? (
              <Acc label="Product details" defaultOpen>
                <div className="text-graphite whitespace-pre-line text-[14.5px] leading-[1.6]">
                  {product.description}
                </div>
              </Acc>
            ) : null}
            {accordions.map((section, i) => (
              <Acc
                key={section._id ?? `acc-${i}`}
                label={section.heading}
                defaultOpen={!hasDescription && i === 0}
              >
                <div className="m-0 text-graphite whitespace-pre-line text-[14.5px] leading-[1.6]">
                  {section.body}
                </div>
              </Acc>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function Acc({
  label,
  children,
  defaultOpen,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen ? true : undefined} className="border-b border-(--hairline)">
      <summary className="list-none cursor-pointer flex items-center justify-between text-ink font-sans font-medium py-4.5 text-[15px]">
        {label}
        <IconChevronDown size={16} />
      </summary>
      <div className="pb-4.5 text-[14.5px]">{children}</div>
    </details>
  )
}

// ─────────────────────────────────────────────────────────────────
function StickyAddToBag({
  product,
  selectedVariant,
  effectivePrice,
  isOutOfStock,
  onAddToBag,
}: {
  product: Product
  selectedVariant: ProductVariant | null
  effectivePrice: number
  isOutOfStock: boolean
  onAddToBag: () => void
}) {
  const formatPrice = useFormatPrice()
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-(--paper) border-t border-(--hairline) px-4 py-3 flex items-center gap-3">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[13px] truncate text-(--graphite)">{product.name}</span>
        <span className="text-[15px] font-semibold text-(--ink)">
          {formatPrice(effectivePrice)}
        </span>
      </div>
      <Button
        variant="primary"
        size="default"
        onClick={onAddToBag}
        disabled={isOutOfStock || !selectedVariant}
      >
        {isOutOfStock ? 'Out of stock' : 'Add to bag'}
        {!isOutOfStock ? <IconArrowRight size={14} /> : null}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="bg-(--paper)">
      <div className="px-5 md:px-10 lg:px-16 py-10 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14">
        <div className="w-full bg-cream-soft animate-pulse aspect-4/5" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-32 bg-(--cream-soft) animate-pulse" />
          <div className="h-12 w-3/4 bg-(--cream-soft) animate-pulse" />
          <div className="h-3 w-1/2 bg-(--cream-soft) animate-pulse" />
          <div className="h-8 w-32 bg-(--cream-soft) animate-pulse mt-4" />
        </div>
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <section className="px-5 md:px-10 lg:px-16 py-32 text-center">
      <div className="t-eyebrow text-(--mute) mb-4">404</div>
      <h1 className="m-0 font-display italic font-semibold text-[56px] text-ink">
        We can't find that one.
      </h1>
      <p className="t-body mt-3 text-(--graphite) max-w-105 mx-auto">
        It may have been archived or moved. Everything else is still in the shop.
      </p>
      <Link
        to="/shop"
        className="mt-6 inline-flex items-center gap-2 text-(--ink) text-[14px] font-medium border-b border-(--ink) pb-0.5 no-underline"
      >
        Back to shop <IconArrowRight size={14} />
      </Link>
    </section>
  )
}
