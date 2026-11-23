// Home: the design system's home page. Structure, classes and motion follow
// the design exactly. The shop and education grids pull the live catalogue.
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Hero } from '@/modules/platform/components/home/Hero'
import { useProducts } from '@/lib/network/api/product.api'
import type { Product, ProductCategory } from '@/lib/network/types/product.types'
import { useSeo } from '@/lib/seo'
import founder from '@/assets/kenny-000.jpg'
import founderStage from '@/assets/kenny-1.jpg'
import community from '@/assets/about-mensa.jpg'
import invitation from '@/assets/invitation.jpg'
import starter from '@/assets/sum_box.jpg'
import smile from '@/assets/hero-7.jpg'

const delay = (d: string) => ({ '--d': d }) as CSSProperties

function Arrow() {
  return (
    <svg className="arrow" width="18" height="18">
      <use href="#i-arrow" />
    </svg>
  )
}

/** Two line headline that slides up line by line as it scrolls into view. */
function SplitHeading({ lines, className }: { lines: React.ReactNode[]; className?: string }) {
  return (
    <h2 className={`split${className ? ` ${className}` : ''}`}>
      {lines.map((line, i) => (
        <span key={i} className="split-line">
          <span style={i ? delay(`${i * 0.1}s`) : undefined}>{line}</span>
        </span>
      ))}
    </h2>
  )
}

// The trust strip from our old home page, now scrolling.
const MARQUEE = [
  'Nationwide delivery · 2 to 5 days',
  '30 day comfort guarantee',
  '5 year lifetime, zero monthly cost',
  'Puts women and girls first',
]

const REASONS = [
  {
    icon: 'i-clock',
    title: 'More convenient.',
    body: "Your day is already busy enough. You shouldn't have to worry about getting stained while you're at work, in school, travelling, sleeping, or simply living your life. Mensa gives you reliable protection, so your period becomes one less thing to think about.",
  },
  {
    icon: 'i-wallet',
    title: 'More cost-effective.',
    body: "Buying disposable pads every month is beginning to look like an expensive subscription. Mensa's reusable period products are designed to last for years, helping you save money while reducing the amount of plastic waste you throw away.",
  },
  {
    icon: 'i-leaf',
    title: 'More modern.',
    body: 'Periods deserve more than outdated products and awkward conversations. Mensa combines chic reusable period care, fun and relatable menstrual health education, and bold, stylish advocacy that lets you wear the conversation with confidence.',
  },
]

const CATEGORY_TAG: Record<ProductCategory, string> = {
  pants: 'Period pants',
  pads: 'Reusable pads',
  bundles: 'Starter set',
  education: 'Education',
  advocacy: 'Advocacy',
}

export function HomePage() {
  useSeo({
    title: 'Your one-stop menstrual health shop',
    description:
      'Better periods start here. Reusable period pants and pads, fun menstrual health education, and fashionable advocacy that puts women and girls first.',
  })

  return (
    <>
      <Hero />

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>
      </div>

      {/* REASONS */}
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                The whys
              </span>
              <SplitHeading
                lines={['Three reasons to switch to Mensa', 'for all things periods.']}
              />
            </div>
          </div>
          <div className="reasons">
            {REASONS.map((r, i) => (
              <article
                key={r.title}
                className="reason"
                data-reveal
                style={i ? delay(`${i * 0.1}s`) : undefined}
              >
                <span className="reason__num">0{i + 1}</span>
                <div className="reason__icon">
                  <svg>
                    <use href={`#${r.icon}`} />
                  </svg>
                </div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS TEASER */}
      <section className="section section--blush">
        <div className="wrap hiw-mini">
          <div>
            <span className="eyebrow" data-reveal>
              How it works
            </span>
            <SplitHeading
              className="text-(length:--fs-h2) mt-[1.1rem]"
              lines={[
                'Wear. Rinse.',
                <>
                  Wash. <span className="accent">Repeat.</span>
                </>,
              ]}
            />
            <ol className="hiw-mini__steps" data-reveal>
              <li>
                <b>Wear it like regular underwear</b>
                <span>No pads, no wings, nothing to change midday.</span>
              </li>
              <li>
                <b>Four layers do the work</b>
                <span>A soft inner layer, absorbent core and leakproof barrier keep you dry.</span>
              </li>
              <li>
                <b>Rinse, wash, air dry</b>
                <span>Cold rinse until it runs clear, wash cool, hang to dry.</span>
              </li>
              <li>
                <b>Rotate and repeat for years</b>
                <span>One on you, one in the wash, one dry and waiting.</span>
              </li>
            </ol>
            <Link className="btn" to="/how-it-works" data-reveal>
              Watch how it works <Arrow />
            </Link>
          </div>
          <div className="hiw-mini__stage" data-reveal>
            {/* Mini exploded layers, auto animating */}
            <div className="layers" style={{ '--lp': '.75' } as CSSProperties}>
              <div className="layers__stack mini-stack [transform:rotateX(58deg)_rotateZ(-38deg)]">
                <div className="layer layer--outer"></div>
                <div className="layer layer--barrier"></div>
                <div className="layer layer--core"></div>
                <div className="layer layer--inner"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section" id="shop">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Shop the range
              </span>
              <SplitHeading lines={['Shop Mensa products.', 'Take one or take all.']} />
            </div>
            <Link className="btn btn--ghost" to="/shop" data-reveal>
              View the full range <Arrow />
            </Link>
          </div>
          <ProductGrid params={{ pageSize: 4, sort: 'featured' }} />
        </div>
      </section>

      {/* IMPACT */}
      <section className="section section--ink">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Impact
              </span>
              <SplitHeading lines={['Switch once.', 'Wear for two years.']} />
            </div>
          </div>
          <div className="impact">
            <div className="impact__item" data-reveal>
              <div className="impact__num" data-count="250" data-suffix="+">
                0
              </div>
              <p>Disposable pads replaced by one pair of Mensa period pants.</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.1s')}>
              <div className="impact__num" data-count="30" data-suffix="ml">
                0
              </div>
              <p>Held by each pant&apos;s absorbent core: about five pads&apos; worth.</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.2s')}>
              <div className="impact__num" data-count="2" data-suffix=" yrs">
                0
              </div>
              <p>How long each pair lasts with proper care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="section" id="story">
        <div className="wrap founder">
          <div className="founder__img" data-reveal>
            <img
              data-parallax
              src={founder}
              alt="Kehinde Abereoje, founder of Mensa Period Products"
            />
          </div>
          <div>
            <span className="eyebrow" data-reveal>
              Our story
            </span>
            <blockquote data-reveal>
              We believe managing your period with knowledge and dignity is a human right.
            </blockquote>
            <p data-reveal>
              At 16, Kehinde realised that too many girls could not afford pads and knew very little
              about their periods. She believed that something as natural as menstruation should
              never determine a girl's confidence, education, or opportunities. So she started
              supporting girls through her nonprofit, one conversation and one community at a time.
            </p>
            <p data-reveal className="mt-4">
              A decade later, she realised that charity alone could never solve period poverty.
              Every girl deserves access to products that are comfortable, sustainable, and made for
              everyday life, not only when she is rich or fortunate enough to meet an NGO or receive
              a donation.
            </p>
            <p data-reveal className="mt-4">
              That's why Mensa was created: to make better period care accessible, make
              conversations around periods fun, and give women products they can genuinely love
              using.
            </p>
            <div className="mt-[2.2rem]" data-reveal>
              <Link className="btn btn--ghost" to="/about">
                Read our story <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION: ours, in the design's shop grid */}
      <EducationSection />

      {/* COMMUNITY */}
      <section className="section section--blush">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Community
              </span>
              <SplitHeading lines={['Wear the', 'conversation.']} />
            </div>
            <p className="lede" data-reveal>
              Workshops, launches and outreach with the women and girls we make Mensa for.
            </p>
          </div>
          <div className="gallery">
            <figure data-reveal>
              <img src={community} alt="The Mensa team at a community event" />
              <figcaption>Mensa launch · Abuja</figcaption>
            </figure>
            <figure data-reveal style={delay('.08s')}>
              <img
                src={smile}
                alt="A guest holding a Game Changer for Periods sign"
                className="object-[45%_30%]"
              />
              <figcaption>Game changer for periods</figcaption>
            </figure>
            <figure data-reveal style={delay('.16s')}>
              <img
                src={founderStage}
                alt="Kehinde Abereoje speaking at the Mensa launch"
                className="object-[50%_30%]"
              />
              <figcaption>Period conversations</figcaption>
            </figure>
            <figure data-reveal style={delay('.24s')}>
              <img src={invitation} alt="Guests arriving at a Mensa event" />
              <figcaption>Our community</figcaption>
            </figure>
            <figure data-reveal style={delay('.32s')}>
              <img src={starter} alt="Mensa reusable period products being prepared" />
              <figcaption>Packed in Abuja</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS */}
      <section className="section" id="partner">
        <div className="wrap">
          <div className="banner" data-reveal>
            <img src={community} alt="" />
            <div className="banner__body">
              <div>
                <span className="eyebrow text-(--blush-2)">Partnerships</span>
                <h2 className="mt-4">Partnering to end period poverty.</h2>
                <p>
                  Schools, NGOs, governments and individuals can partner with Mensa to provide
                  sustainable and dignified period care for girls in their communities.
                </p>
              </div>
              <Link className="btn btn--light" to="/partnerships">
                Become a partner <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function EducationSection() {
  const query = useProducts({ category: 'education', pageSize: 4, sort: 'featured' })
  if ((query.data?.data?.items ?? []).length === 0) return null
  return (
    <section className="section">
      <div className="wrap">
        <div className="section__head">
          <div>
            <span className="eyebrow" data-reveal>
              Education
            </span>
            <SplitHeading
              lines={['We make products.', 'We also make space for the conversation.']}
            />
          </div>
        </div>
        <ProductGrid params={{ category: 'education', pageSize: 4, sort: 'featured' }} />
      </div>
    </section>
  )
}

/** Live catalogue in the design's product cards. */
function ProductGrid({ params }: { params: Parameters<typeof useProducts>[0] }) {
  const query = useProducts(params)
  const items: Product[] = query.data?.data?.items ?? []
  return (
    <div className="products">
      {items.map((p, i) => {
        const image = p.images?.[0]
        const tag = p.isSoldOut ? 'Sold out' : p.salePrice ? 'On sale' : CATEGORY_TAG[p.category]
        return (
          <Link
            key={p.id}
            className="product"
            to={`/shop/${p.slug}`}
            data-reveal
            style={i ? delay(`${i * 0.08}s`) : undefined}
          >
            <div className="product__img">
              {image ? <img src={image.url} alt={image.alt || p.name} /> : null}
              {tag ? <span className="product__tag">{tag}</span> : null}
              <span className="product__add">Shop now</span>
            </div>
            <div>
              <h3>{p.name}</h3>
              <p>{p.subheading || p.shortDescription}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
