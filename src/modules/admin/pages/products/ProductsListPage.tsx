// ═══════════════════════════════════════════════════════════════
// /products (admin) — catalogue table.
//
// Lists every product including archived (isActive=false) so the
// admin can reactivate or audit removed SKUs. Search + category
// filter operate against the full result set in memory (8 SKUs at
// launch; we'll move filters server side when the catalogue grows).
// ═══════════════════════════════════════════════════════════════
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAdminProducts } from '@/lib/network/api/product.api'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import { Button } from '@/components/ui/button'
import { formatNaira, cn } from '@/lib/utils'

const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pants', label: 'Period pants' },
  { id: 'pads', label: 'Reusable pads' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'education', label: 'Education' },
]

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  pants: 'Pants',
  pads: 'Pads',
  bundles: 'Bundles',
  education: 'Education',
}

export function ProductsListPage() {
  const query = useAdminProducts({ pageSize: 100 })
  const products = query.data?.data?.items ?? []

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all')

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.variants?.some((v) => v.sku.toLowerCase().includes(q))
      )
    })
  }, [products, activeCategory, search])

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Catalogue</div>
          <h1
            className="m-0"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 'clamp(32px, 5vw, 48px)',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              color: 'var(--ink)',
            }}
          >
            Products
          </h1>
          <p className="t-body-s mt-2 text-graphite">
            Every product in the store. Search by name, slug, or SKU.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/products/new">
            <Plus size={16} strokeWidth={2} />
            <span className="hidden sm:inline">New product</span>
            <span className="sm:hidden">New</span>
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 md:gap-4 flex-wrap mb-5 md:mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-full sm:min-w-[240px] max-w-full sm:max-w-[420px]">
          <Search
            size={16}
            strokeWidth={1.6}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="h-10 w-full pl-10 pr-3.5 bg-paper border border-hairline text-[14px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => {
            const isActive = c.id === activeCategory
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  'inline-flex items-center rounded-full font-sans font-medium whitespace-nowrap transition-colors',
                  'px-3.5 py-1.5 text-[12.5px]',
                  isActive
                    ? 'bg-ink text-paper border border-ink'
                    : 'bg-transparent text-ink border border-hairline hover:border-ink',
                )}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table / states */}
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState hasFilter={search !== '' || activeCategory !== 'all'} />
      ) : (
        <ProductsTable products={visible} />
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────
function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="border border-hairline-soft bg-paper overflow-x-auto">
      <div className="min-w-[820px]">
        {/* Header row */}
        <div
          className="grid items-center px-5 py-3 border-b border-hairline-soft bg-cream-soft text-[10px] uppercase tracking-[0.12em] font-medium text-mute font-mono"
          style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 0.8fr 0.6fr' }}
        >
          <div>Product</div>
          <div>Category</div>
          <div className="text-right">B2C price</div>
          <div className="text-right">Variants</div>
          <div className="text-right">Stock</div>
          <div className="text-right">Status</div>
        </div>

        {products.map((product, i) => (
          <Row key={product.slug} product={product} isLast={i === products.length - 1} />
        ))}
      </div>
    </div>
  )
}

function Row({ product, isLast }: { product: Product; isLast: boolean }) {
  const variants = product.variants ?? []
  const totalStock = variants.reduce((sum, v) => sum + v.stockCount, 0)
  const variantCount = variants.length
  const lowStock = variants.some((v) => v.stockCount <= v.lowStockThreshold && v.isActive)

  return (
    <Link
      to={`/products/${product.slug}/edit`}
      className={cn(
        'grid items-center px-5 py-4 no-underline transition-colors hover:bg-cream-soft',
        !isLast && 'border-b border-hairline-soft',
      )}
      style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 0.8fr 0.6fr' }}
    >
      {/* Product cell */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-shrink-0 w-12 h-12 bg-blush flex items-center justify-center overflow-hidden"
          style={{ borderRadius: 2 }}
        >
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-[9px] uppercase tracking-[0.1em] text-berry opacity-60 font-mono"
            >
              n/a
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div
            className="truncate text-ink"
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 18,
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
            }}
          >
            {product.name}
          </div>
          <div
            className="truncate text-mute font-mono mt-0.5"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
            }}
          >
            {product.slug}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="text-[13px] text-graphite">
        {CATEGORY_LABEL[product.category]}
      </div>

      {/* B2C price */}
      <div className="text-right text-[14px] text-ink font-medium">
        {formatNaira(product.basePriceB2C)}
      </div>

      {/* Variants */}
      <div className="text-right text-[13px] text-graphite">
        {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
      </div>

      {/* Stock */}
      <div className="text-right">
        <span
          className={cn(
            'text-[13px]',
            totalStock === 0
              ? 'text-err'
              : lowStock
                ? 'text-coral'
                : 'text-graphite',
          )}
        >
          {totalStock}
        </span>
      </div>

      {/* Status */}
      <div className="text-right">
        {product.isActive ? (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-ok font-medium"
            style={{ letterSpacing: '0.04em' }}
          >
            <span className="rounded-full" style={{ width: 6, height: 6, background: 'var(--ok)' }} />
            Active
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-mute font-medium"
            style={{ letterSpacing: '0.04em' }}
          >
            <span
              className="rounded-full"
              style={{ width: 6, height: 6, background: 'var(--mute)' }}
            />
            Archived
          </span>
        )}
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="border border-hairline-soft bg-paper">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-4 border-b border-hairline-soft last:border-b-0"
        >
          <div
            className="w-12 h-12 bg-cream-soft animate-pulse"
            style={{ borderRadius: 2 }}
          />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 bg-cream-soft animate-pulse w-1/3" />
            <div className="h-3 bg-cream-soft animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-err mb-3">Something went wrong</div>
      <h3
        className="m-0"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 24,
          color: 'var(--ink)',
        }}
      >
        We couldn't load the catalogue.
      </h3>
      <Button variant="secondary" size="default" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="border border-hairline-soft bg-paper p-12 text-center">
      <div className="t-eyebrow text-mute mb-3">
        {hasFilter ? 'No matches' : 'Empty catalogue'}
      </div>
      <h3
        className="m-0"
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 24,
          color: 'var(--ink)',
        }}
      >
        {hasFilter ? 'Nothing matches that filter.' : 'No products yet.'}
      </h3>
      {!hasFilter ? (
        <Button asChild variant="primary" size="default" className="mt-5">
          <Link to="/products/new">
            <Plus size={14} strokeWidth={2} /> Add the first product
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
