// /shop: the design system's collection page. Category lives in ?category=,
// sort in ?sort= and the navbar search in ?q=, so every view can be shared.
import { useMemo, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '@/lib/network/api/product.api'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import { SizeGuideDialog } from '@/components/shop/SizeGuideDialog'
import { useFormatPrice } from '@/lib/currency'
import { useSeo } from '@/lib/seo'
import { ProductCard, priceRange } from '@/modules/platform/components/shop/ProductCard'

const CATEGORIES: { slug: ProductCategory; name: string }[] = [
  { slug: 'pants', name: 'Period pants' },
  { slug: 'pads', name: 'Reusable pads' },
  { slug: 'bundles', name: 'Starter sets' },
  { slug: 'education', name: 'Education' },
  { slug: 'advocacy', name: 'Advocacy' },
]

const isCategory = (v: string | null): v is ProductCategory => CATEGORIES.some((c) => c.slug === v)

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'new'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'new', label: 'Newest' },
]

const inStock = (p: Product) => !p.isSoldOut && (p.variants ?? []).some((v) => v.stockCount > 0)

// Featured keeps the admin's display order, with sold out items last.
const sorters: Record<Sort, (a: Product, b: Product, ia: number, ib: number) => number> = {
  featured: (a, b, ia, ib) => Number(inStock(b)) - Number(inStock(a)) || ia - ib,
  'price-asc': (a, b) => priceRange(a).min - priceRange(b).min,
  'price-desc': (a, b) => priceRange(b).min - priceRange(a).min,
  new: (a, b) => b.createdAt.localeCompare(a.createdAt),
}

/** The lede under each category title. */
const CATEGORY_LEDE: Record<ProductCategory, string> = {
  pants:
    'Leakproof, washable period pants for light to heavy days. Singles, packs of 3 and packs of 5.',
  pads: 'Soft cotton pads with a super absorbent core and waterproof base. Wash, dry and use again.',
  bundles: 'Everything you need to switch away from disposables, in one box.',
  education:
    'Period education that girls (and grown ups) actually enjoy: a comic book and a conversation game.',
  advocacy: 'Stickers, pins and totes that start conversations and end the stigma.',
}

const CATEGORY_SEO: Record<ProductCategory, string> = {
  pants: 'Reusable Mensa period pants. Designed in Abuja, made for Nigerian women.',
  pads: 'Mensa reusable pads. Replace hundreds of disposables with one set that lasts for years.',
  bundles: 'Everything you need to switch away from disposables, for less than months of pads.',
  education: 'My Cycoo, the FLOW Game and more Mensa education for classrooms and homes.',
  advocacy: 'Pins, totes and everyday pieces that turn period conversations into culture.',
}

function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size}>
      <use href="#i-arrow" />
    </svg>
  )
}

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const categoryParam = params.get('category')
  const active = isCategory(categoryParam)
    ? CATEGORIES.find((c) => c.slug === categoryParam)
    : undefined
  const sortParam = params.get('sort')
  const sort: Sort = SORTS.some((s) => s.value === sortParam) ? (sortParam as Sort) : 'featured'
  const q = (params.get('q') ?? '').trim()
  const formatPrice = useFormatPrice()

  useSeo(
    active
      ? { title: active.name, description: CATEGORY_SEO[active.slug] }
      : {
          title: 'Shop everything',
          description:
            'Reusable period pants and pads, period education and advocacy merch. Made in Nigeria, shipped from Abuja.',
        },
  )

  const query = useProducts({ pageSize: 60 })
  const all: Product[] = useMemo(() => query.data?.data?.items ?? [], [query.data])

  const counts = useMemo(() => {
    const acc: Partial<Record<ProductCategory, number>> = {}
    for (const p of all) acc[p.category] = (acc[p.category] ?? 0) + 1
    return acc
  }, [all])

  const products = useMemo(() => {
    const needle = q.toLowerCase()
    const indexed = all.map((p, i) => ({ p, i }))
    return indexed
      .filter(({ p }) => !active || p.category === active.slug)
      .filter(
        ({ p }) =>
          !needle ||
          `${p.name} ${p.shortDescription ?? ''} ${p.description ?? ''}`
            .toLowerCase()
            .includes(needle),
      )
      .sort((a, b) => sorters[sort](a.p, b.p, a.i, b.i))
      .map(({ p }) => p)
  }, [all, active, sort, q])

  const href = (cat?: ProductCategory) => {
    const next = new URLSearchParams()
    if (cat) next.set('category', cat)
    if (sort !== 'featured') next.set('sort', sort)
    const s = next.toString()
    return `/shop${s ? `?${s}` : ''}`
  }

  const setSort = (value: Sort) => {
    const next = new URLSearchParams(params)
    if (value === 'featured') next.delete('sort')
    else next.set('sort', value)
    setParams(next, { preventScrollReset: true })
  }

  const clearSearch = () => {
    const next = new URLSearchParams(params)
    next.delete('q')
    setParams(next)
  }

  const pack3 = all.find((p) => p.slug === 'mensa-period-pants-pack-of-3')
  const singles = all.find((p) => p.slug === 'period-pants-singles')
  const pack3Photo = pack3
    ? [...(pack3.images ?? [])].sort((a, b) => a.order - b.order)[0]
    : undefined

  return (
    <div className="shop">
      <header className="shop-hero">
        <div className="wrap shop-hero__inner">
          <div>
            <span className="eyebrow">{active ? 'Shop' : 'The collection'}</span>
            <h1 className="split" key={active?.slug ?? 'all'}>
              <span className="split-line">
                <span>{active ? active.name : 'Everything for'}</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>
                  {active ? (
                    <span className="accent">by Mensa.</span>
                  ) : (
                    <>
                      a <span className="accent">better period.</span>
                    </>
                  )}
                </span>
              </span>
            </h1>
          </div>
          <p className="lede">
            {active
              ? CATEGORY_LEDE[active.slug]
              : 'Reusable pants and pads, period education and advocacy you can wear. Made in Nigeria and shipped from Abuja.'}
          </p>
        </div>
        <ul className="wrap shop-perks" aria-label="Why shop with us">
          <li>
            <svg>
              <use href="#i-bag" />
            </svg>
            <span>
              <b>Nationwide delivery</b> from our studio in Abuja
            </span>
          </li>
          <li>
            <svg>
              <use href="#i-shield" />
            </svg>
            <span>
              <b>Leakproof</b> protection for light to heavy days
            </span>
          </li>
          <li>
            <svg>
              <use href="#i-repeat" />
            </svg>
            <span>
              <b>Lasts up to 2 years</b> with proper care
            </span>
          </li>
          <li>
            <svg>
              <use href="#i-leaf" />
            </svg>
            <span>
              <b>Made in Nigeria</b>, shipped from Abuja
            </span>
          </li>
        </ul>
      </header>

      <div className="shop-bar">
        <div className="wrap shop-bar__inner">
          <nav className="shop-cats" aria-label="Categories">
            <Link to={href()} className={!active ? 'is-active' : ''} preventScrollReset>
              All <span>{all.length}</span>
            </Link>
            {CATEGORIES.filter((c) => counts[c.slug]).map((c) => (
              <Link
                key={c.slug}
                to={href(c.slug)}
                className={active?.slug === c.slug ? 'is-active' : ''}
                preventScrollReset
              >
                {c.name} <span>{counts[c.slug]}</span>
              </Link>
            ))}
          </nav>
          <label className="sort">
            <span>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="wrap shop-grid-wrap">
        {q ? (
          <p className="mb-6 text-(length:--fs-sm) text-(--mute)">
            Results for <b>“{q}”</b> ·{' '}
            <button type="button" className="guide__link" onClick={clearSearch}>
              Clear search
            </button>
          </p>
        ) : null}
        {query.isLoading ? (
          <div className="shop-empty">
            <h2>Loading the collection…</h2>
          </div>
        ) : query.isError ? (
          <div className="shop-empty">
            <h2>The shop is taking a breather.</h2>
            <p>We couldn&apos;t load the products just now. Try again in a moment.</p>
            <button type="button" className="btn" onClick={() => query.refetch()}>
              Try again <Arrow />
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="shop-empty">
            <h2>Nothing here yet.</h2>
            <p>New things are on the sewing table. In the meantime, see everything else.</p>
            <Link className="btn" to="/shop">
              Shop everything <Arrow />
            </Link>
          </div>
        ) : (
          <div className="shop-grid" key={`${active?.slug ?? 'all'}-${sort}-${q}`}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {(!active || active.slug === 'pants') && pack3 ? (
        <section className="wrap">
          <div className="shop-feature" data-reveal>
            <div className="shop-feature__img">
              {pack3Photo ? <img src={pack3Photo.url} alt={pack3.name} /> : null}
            </div>
            <div className="shop-feature__body">
              <span className="eyebrow">Our most complete switch</span>
              <h2>Three pairs, a whole cycle.</h2>
              <p>
                One on, one in the wash, one dry and waiting, with a discreet storage bag for days
                out.
              </p>
              <div className="shop-feature__price">
                <b>{formatPrice(priceRange(pack3).min)}</b>
                {singles ? (
                  <span className="shop-feature__note">
                    vs {formatPrice(priceRange(singles).min * 3)} as three singles
                  </span>
                ) : null}
              </div>
              <div className="shop-feature__ctas">
                <Link className="btn btn--light" to={`/shop/${pack3.slug}`}>
                  Shop the pack of 3 <Arrow />
                </Link>
                {singles ? (
                  <Link className="btn btn--glass" to={`/shop/${singles.slug}`}>
                    Try one first
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section shop-guide">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Not sure where to start?
              </span>
              <h2 className="split">
                <span className="split-line">
                  <span>Three questions,</span>
                </span>
                <span className="split-line">
                  <span style={{ '--d': '.1s' } as CSSProperties}>one easy switch.</span>
                </span>
              </h2>
            </div>
            <Link className="btn btn--ghost" to="/find-my-starter-set" data-reveal>
              Take the fit quiz <Arrow />
            </Link>
          </div>
          <div className="guide">
            <article data-reveal>
              <span>01</span>
              <h3>How many do I need?</h3>
              <p>
                Three pants carry most people through a period: one on, one in the wash, one dry and
                waiting. New to them? Try a single first, then come back for a pack of 3 or 5.
              </p>
            </article>
            <article data-reveal style={{ '--d': '.08s' } as CSSProperties}>
              <span>02</span>
              <h3>Which size?</h3>
              <p>
                Pick the size you wear in regular underwear, or check the{' '}
                <SizeGuideDialog>
                  <button type="button" className="guide__link">
                    size guide
                  </button>
                </SizeGuideDialog>
                . Between two sizes? Size up.
              </p>
            </article>
            <article data-reveal style={{ '--d': '.16s' } as CSSProperties}>
              <span>03</span>
              <h3>Pants or pads?</h3>
              <p>
                Pants replace pads entirely for light to heavy days. Reusable pads come five to a
                pack, with a wet bag and a handkerchief for discreet drying. Buying in bulk for a
                school or NGO?{' '}
                <Link to="/partnerships" className="guide__link">
                  Partner with us
                </Link>
                .
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
