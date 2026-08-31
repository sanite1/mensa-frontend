// /products (admin) — catalogue table.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, MoreVertical, PackageX, PackageCheck, Plus, Search } from 'lucide-react'
import { useAdminProducts, useUpdateProduct } from '@/lib/network/api/product.api'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatNaira, cn } from '@/lib/utils'

const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pants', label: 'Period pants' },
  { id: 'pads', label: 'Reusable pads' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'education', label: 'Education' },
  { id: 'advocacy', label: 'Fashion items · Period advocacy' },
]

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  pants: 'Pants',
  pads: 'Pads',
  bundles: 'Bundles',
  education: 'Education',
  advocacy: 'Advocacy',
}

// Grid columns are kept on the className with an arbitrary value so the
// header and every row stay in lock-step automatically.
const ROW_COLS = 'grid-cols-[2.2fr_1fr_1fr_0.9fr_0.7fr_0.9fr_44px]'

export function ProductsListPage() {
  const query = useAdminProducts({ pageSize: 100 })
  const products: Product[] = query.data?.data?.items ?? []

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
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6 md:mb-8">
        <div className="min-w-0">
          <div className="t-eyebrow text-mute mb-3">Catalogue</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(32px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
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
        <div className="relative flex-1 min-w-full sm:min-w-60 max-w-full sm:max-w-105">
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
      <div className="min-w-220">
        {/* Header row */}
        <div
          className={cn(
            'grid items-center px-5 py-3 border-b border-hairline-soft bg-cream-soft text-[10px] uppercase tracking-[0.12em] font-medium text-mute font-mono',
            ROW_COLS,
          )}
        >
          <div>Product</div>
          <div>Category</div>
          <div className="text-right">B2C price</div>
          <div className="text-right">Variants</div>
          <div className="text-right">Stock</div>
          <div className="text-right">Status</div>
          <div />
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

  const update = useUpdateProduct()
  const busy = update.isPending

  const toggleVisibility = () => {
    if (busy) return
    update.mutate({
      slug: product.slug,
      payload: { isActive: !product.isActive },
    })
  }
  const toggleSoldOut = () => {
    if (busy) return
    update.mutate({
      slug: product.slug,
      payload: { isSoldOut: !product.isSoldOut },
    })
  }

  return (
    <div
      className={cn(
        'grid items-center px-5 py-4 transition-colors hover:bg-cream-soft',
        ROW_COLS,
        !isLast && 'border-b border-hairline-soft',
      )}
    >
      {/* Product cell — only the name + thumb area navigates. Keeps the
          actions kebab from fighting the row link for clicks. */}
      <Link
        to={`/products/${product.slug}/edit`}
        className="flex items-center gap-3 min-w-0 no-underline"
      >
        <div className="shrink-0 w-12 h-12 bg-blush flex items-center justify-center overflow-hidden rounded-xs">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[9px] uppercase tracking-widest text-berry opacity-60 font-mono">
              n/a
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-ink font-display italic font-semibold text-[18px] leading-[1.1] tracking-[-0.015em]">
            {product.name}
          </div>
          <div className="truncate text-mute font-mono mt-0.5 text-[11px] tracking-[0.06em]">
            {product.slug}
          </div>
        </div>
      </Link>

      {/* Category */}
      <div className="text-[13px] text-graphite">{CATEGORY_LABEL[product.category]}</div>

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
            totalStock === 0 ? 'text-err' : lowStock ? 'text-coral' : 'text-graphite',
          )}
        >
          {totalStock}
        </span>
      </div>

      {/* Status — communicates both isActive and isSoldOut. */}
      <div className="flex flex-col items-end gap-1">
        <StatusPill
          tone={product.isActive ? 'ok' : 'mute'}
          label={product.isActive ? 'Visible' : 'Hidden'}
        />
        {product.isSoldOut ? <StatusPill tone="coral" label="Sold out" /> : null}
      </div>

      {/* Row actions */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open product actions"
              disabled={busy}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center text-graphite hover:bg-cream rounded-sm',
                busy && 'opacity-50 cursor-not-allowed',
              )}
            >
              <MoreVertical size={16} strokeWidth={1.6} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-paper border border-hairline-soft min-w-55"
          >
            <DropdownMenuItem onSelect={() => toggleVisibility()} className="text-[13px] text-ink">
              {product.isActive ? (
                <>
                  <EyeOff size={14} strokeWidth={1.6} />
                  Hide from storefront
                </>
              ) : (
                <>
                  <Eye size={14} strokeWidth={1.6} />
                  Show on storefront
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toggleSoldOut()} className="text-[13px] text-ink">
              {product.isSoldOut ? (
                <>
                  <PackageCheck size={14} strokeWidth={1.6} />
                  Mark as in stock
                </>
              ) : (
                <>
                  <PackageX size={14} strokeWidth={1.6} />
                  Mark as sold out
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-hairline-soft" />
            <DropdownMenuItem asChild className="text-[13px] text-ink">
              <Link to={`/products/${product.slug}/edit`}>Edit product</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function StatusPill({ tone, label }: { tone: 'ok' | 'mute' | 'coral'; label: string }) {
  const toneClass = tone === 'ok' ? 'text-ok' : tone === 'coral' ? 'text-coral' : 'text-mute'
  const dotClass = tone === 'ok' ? 'bg-ok' : tone === 'coral' ? 'bg-coral' : 'bg-mute'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em]',
        toneClass,
      )}
    >
      <span className={cn('rounded-full w-1.5 h-1.5', dotClass)} />
      {label}
    </span>
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
          <div className="w-12 h-12 bg-cream-soft animate-pulse rounded-xs" />
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
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
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
      <div className="t-eyebrow text-mute mb-3">{hasFilter ? 'No matches' : 'Empty catalogue'}</div>
      <h3 className="m-0 font-display italic font-semibold text-[24px] text-ink">
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
