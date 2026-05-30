// ═══════════════════════════════════════════════════════════════
// /shop — collection grid for all active products.
// Category filter is reflected in the URL (?category=pants) so back
// button works the way customers expect.
// ═══════════════════════════════════════════════════════════════
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '@/lib/network/api/product.api'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import { ShopCard } from '@/components/shop/ShopCard'
import { CategoryChips } from '@/components/shop/CategoryChips'
import { IconArrowRight, IconChevronRight } from '@/components/chrome/icons'
import { features, FREE_DELIVERY_THRESHOLD_LABEL } from '@/lib/features'

function isCategory(value: string | null): value is ProductCategory {
  return value === 'pants' || value === 'pads' || value === 'bundles' || value === 'education'
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const activeCategory: ProductCategory | null = isCategory(categoryParam) ? categoryParam : null

  // Fetch all products (no pagination at launch — 8 SKUs).
  const allProductsQuery = useProducts({ pageSize: 60 })
  const products: Product[] = allProductsQuery.data?.data?.items ?? []

  // Counts per category from the full unfiltered list, used by the chips.
  const counts = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const p of products) {
      acc[p.category] = (acc[p.category] ?? 0) + 1
    }
    return acc
  }, [products])

  const visible = activeCategory ? products.filter((p) => p.category === activeCategory) : products

  const setCategory = (next: ProductCategory | null) => {
    const params = new URLSearchParams(searchParams)
    if (next) params.set('category', next)
    else params.delete('category')
    setSearchParams(params, { replace: false })
  }

  return (
    <div className="bg-(--paper)">
      {/* ── Page title / breadcrumb / trust strip ───────────────────── */}
      <PageHeader productCount={products.length} />

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="border-y border-(--hairline) bg-(--paper)">
        <div className="px-5 md:px-10 lg:px-16 py-3 md:py-4 lg:py-5 flex items-center justify-between gap-4 flex-wrap">
          <CategoryChips
            active={activeCategory}
            onChange={setCategory}
            counts={counts}
            density="lg"
          />
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 lg:px-16 py-8 md:py-10 lg:py-12 pb-20 md:pb-24">
        {allProductsQuery.isLoading ? (
          <LoadingGrid />
        ) : allProductsQuery.isError ? (
          <ErrorState onRetry={() => allProductsQuery.refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState onReset={() => setCategory(null)} />
        ) : (
          <div className="grid gap-3.5 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((product) => (
              <ShopCard key={product.slug ?? product.id} product={product} />
            ))}
          </div>
        )}

        {visible.length > 0 ? (
          <GridFooter total={visible.length} totalAll={products.length} />
        ) : null}
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function PageHeader({ productCount }: { productCount: number }) {
  return (
    <section className="px-5 md:px-10 lg:px-16 pt-10 md:pt-16 lg:pt-22 pb-7 md:pb-10 lg:pb-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 font-sans text-[13px] text-(--mute)">
        <Link to="/" className="text-inherit no-underline">
          Mensa
        </Link>
        <IconChevronRight size={12} />
        <span className="text-(--ink)">Shop</span>
      </div>

      {/* Title */}
      <h1 className="mt-6 font-display italic font-semibold text-[clamp(44px,8vw,96px)] leading-[0.98] tracking-tight text-ink">
        Shop <span className="text-pink">everything</span> Mensa.
      </h1>

      {/* Trust strip */}
      <div className="flex items-baseline justify-between gap-6 flex-wrap mt-6">
        <p className="m-0 text-graphite max-w-155 text-[clamp(15px,2vw,18px)] leading-[1.55]">
          {productCount > 0 ? (
            <>
              {productCount} products. One promise. Built to last five years.
              {features.freeDelivery
                ? ` Free delivery on orders over ${FREE_DELIVERY_THRESHOLD_LABEL}.`
                : ''}
            </>
          ) : (
            <>
              One promise. Built to last five years.
              {features.freeDelivery
                ? ` Free delivery on orders over ${FREE_DELIVERY_THRESHOLD_LABEL}.`
                : ''}
            </>
          )}
        </p>
        <div className="flex items-center gap-3.5 text-[13px] text-(--graphite) flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-full w-2 h-2 bg-ok" />
            {productCount} in stock
          </span>
          <span className="opacity-40">·</span>
          <span>Ships in 2 to 5 days</span>
          <span className="opacity-40">·</span>
          <span>30 day comfort guarantee</span>
        </div>
      </div>
    </section>
  )
}

function LoadingGrid() {
  return (
    <div className="grid gap-3.5 md:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="w-full bg-cream-soft animate-pulse aspect-4/5" />
          <div className="h-6 bg-(--cream-soft) animate-pulse w-3/4" />
          <div className="h-3 bg-(--cream-soft) animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-24 text-center">
      <div className="t-eyebrow text-(--err) mb-4">Something went wrong</div>
      <h2 className="m-0 font-display italic font-semibold text-[36px] text-ink">
        We couldn't load the shop.
      </h2>
      <p className="t-body mt-3 text-(--graphite) max-w-105 mx-auto">
        Check that the backend is running on port 4000, then try again. The browser console will
        have more detail if the request failed.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 text-(--ink) text-[14px] font-medium border-b border-(--ink) pb-0.5"
      >
        Try again <IconArrowRight size={14} />
      </button>
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-24 text-center">
      <div className="t-eyebrow text-(--mute) mb-4">No matches</div>
      <h2 className="m-0 font-display italic font-semibold text-[36px] text-ink">
        Nothing here yet.
      </h2>
      <p className="t-body mt-3 text-(--graphite) max-w-105 mx-auto">
        Try a different category. Everything Mensa is still close at hand.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 text-(--ink) text-[14px] font-medium border-b border-(--ink) pb-0.5"
      >
        See all products <IconArrowRight size={14} />
      </button>
    </div>
  )
}

function GridFooter({ total, totalAll }: { total: number; totalAll: number }) {
  return (
    <div className="flex items-center justify-between pt-10 md:pt-14 gap-6 flex-wrap">
      <div className="t-body-s text-(--mute)">
        Showing {total} of {totalAll} products
      </div>
      <div className="flex items-center gap-4 md:gap-5">
        <Link
          to="/size-guide"
          className="inline-flex items-center gap-2 text-(--ink) no-underline text-[14px] font-medium border-b border-(--ink) pb-0.5"
        >
          Read the size guide <IconArrowRight size={14} />
        </Link>
        <Link
          to="/partnerships"
          className="inline-flex items-center gap-2 text-(--ink) no-underline text-[14px] font-medium border-b border-(--ink) pb-0.5"
        >
          Wholesale &amp; schools <IconArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
