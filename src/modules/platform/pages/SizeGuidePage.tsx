// /size-guide: ported from the design repo. Size finder and chart, how to measure, fit notes, FAQ.
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { SizeFinder } from '@/components/design/SizeFinder'
import { useSeo } from '@/lib/seo'

export function SizeGuidePage() {
  useSeo({
    title: 'Size guide',
    description:
      "Find your Mensa period pant size in a minute: measure your waist and we'll match you, S to 3XL. Between two sizes? Size up.",
  })
  return (
    <main className="fit">
      {/* HERO */}
      <header className="fit-hero">
        <div className="wrap fit-hero__inner">
          <div>
            <span className="eyebrow">Size guide</span>
            <h1 className="split">
              <span className="split-line">
                <span>A fit that feels</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>
                  like a <span className="accent">hug.</span>
                </span>
              </span>
            </h1>
          </div>
          <div className="fit-hero__aside">
            <p className="lede">
              One measurement, one minute. A snug fit keeps the absorbent layer close to your skin,
              which is what keeps you dry.
            </p>
            <div className="fit-hero__ctas">
              <a className="btn" href="#find">
                Find my size{' '}
                <svg className="arrow" width="18" height="18">
                  <use href="#i-arrow" />
                </svg>
              </a>
              <a className="btn btn--ghost" href="#measure">
                How to measure
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* CALCULATOR + TABLE */}
      <section className="section fit-find" id="find">
        <div className="wrap">
          <SizeFinder />
        </div>
      </section>

      {/* HOW TO MEASURE */}
      <section className="section section--blush" id="measure">
        <div className="wrap measure">
          <figure className="measure__art" data-reveal>
            <BodyOutline />
            <figcaption>Measure over thin underwear or bare skin, standing relaxed.</figcaption>
          </figure>
          <div>
            <span className="eyebrow" data-reveal>
              How to measure
            </span>
            <h2
              className="split"
              style={{ fontSize: 'var(--fs-h2)', marginTop: '1.1rem' } as CSSProperties}
            >
              <span className="split-line">
                <span>Grab a tape.</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>Breathe out.</span>
              </span>
            </h2>
            <ol className="measure__steps" data-reveal>
              <li>
                <b>Find your waist</b>
                <span>
                  It&apos;s the narrowest part of your torso, usually just above your belly button.
                </span>
              </li>
              <li>
                <b>Wrap a soft tape around it</b>
                <span>
                  Keep it level all the way round, flat and snug but not tight. Don&apos;t hold your
                  breath or pull it in.
                </span>
              </li>
              <li>
                <b>Match the range</b>
                <span>
                  Pop the number in above, or find it in the chart. In two ranges? Size up.
                </span>
              </li>
            </ol>
            <p className="measure__note" data-reveal>
              No tape? A phone charger cable or a piece of string works: mark it, then lay it
              against a ruler.
            </p>
          </div>
        </div>
      </section>

      {/* FIT NOTES */}
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Fit notes
              </span>
              <h2 className="split">
                <span className="split-line">
                  <span>What good fit</span>
                </span>
                <span className="split-line">
                  <span style={{ '--d': '.1s' } as CSSProperties}>looks like.</span>
                </span>
              </h2>
            </div>
          </div>
          <div className="fitnotes">
            <article data-reveal>
              <span className="fitnotes__icon">
                <svg>
                  <use href="#i-shield" />
                </svg>
              </span>
              <h3>A hug, not a squeeze</h3>
              <p>
                The pant should sit flat against your body with no gaps at the legs, without digging
                in at the waistband.
              </p>
            </article>
            <article data-reveal style={{ '--d': '.08s' } as CSSProperties}>
              <span className="fitnotes__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <h3>Between two sizes? Size up.</h3>
              <p>
                Our size ranges overlap. If your waist sits in two of them, go for the larger one.
              </p>
            </article>
            <article data-reveal style={{ '--d': '.16s' } as CSSProperties}>
              <span className="fitnotes__icon">
                <svg>
                  <use href="#i-drop" />
                </svg>
              </span>
              <h3>Pads are one size</h3>
              <p>
                Our reusable pads are 13 inches long and sit in your own underwear, so there&apos;s
                no size to choose.
              </p>
            </article>
            <article data-reveal style={{ '--d': '.24s' } as CSSProperties}>
              <span className="fitnotes__icon">
                <svg>
                  <use href="#i-bag" />
                </svg>
              </span>
              <h3>S to 3XL</h3>
              <p>
                Singles and packs of 3 and 5 come in every size. Over 44&quot;? Email us and
                we&apos;ll point you to 2XL or 3XL.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--blush">
        <div className="wrap fitfaq">
          <div>
            <span className="eyebrow" data-reveal>
              Questions
            </span>
            <h2
              className="split"
              style={{ fontSize: 'var(--fs-h2)', marginTop: '1.1rem' } as CSSProperties}
            >
              <span className="split-line">
                <span>Still not</span>
              </span>
              <span className="split-line">
                <span style={{ '--d': '.1s' } as CSSProperties}>sure?</span>
              </span>
            </h2>
          </div>
          <div className="fitfaq__list" data-reveal>
            <details>
              <summary>Will they shrink in the wash?</summary>
              <p>
                Not if you follow the care guide: cold rinse before the first wash, machine wash
                cold on a delicate cycle or hand wash with neutral detergent, and hang to dry. No
                bleach or fabric softener.
              </p>
            </details>
            <details>
              <summary>My waist is in two sizes. Which do I pick?</summary>
              <p>
                The larger one. The ranges overlap on purpose, and the finder above sizes you up
                automatically.
              </p>
            </details>
            <details>
              <summary>My waist is over 44 inches.</summary>
              <p>
                We make 2XL and 3XL. Email{' '}
                <a href="mailto:hi@mensaproducts.com">hi@mensaproducts.com</a> with your waist
                measurement and we&apos;ll recommend a size.
              </p>
            </details>
            <details>
              <summary>What about postpartum, or heavier days?</summary>
              <p>
                Size for comfort. Many people find the next size up more comfortable after birth or
                on bloated days, and a pant that doesn&apos;t dig in stays in place better.
              </p>
            </details>
            <details>
              <summary>What if the size is wrong?</summary>
              <p>
                For hygiene reasons we can&apos;t take back period products. But wrong, damaged, or
                wrong size items reported within three days of delivery, we make right.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="wrap">
          <div className="fit-cta" data-reveal>
            <div>
              <span className="eyebrow">Not sure what to get?</span>
              <h2>Find your starter set.</h2>
              <p>
                Eight quick questions about your flow and your days, and we&apos;ll tell you what to
                start with.
              </p>
            </div>
            <div className="fit-cta__btns">
              <Link className="btn btn--light" to="/find-my-starter-set">
                Take the quiz{' '}
                <svg className="arrow" width="18" height="18">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              <Link className="btn btn--glass" to="/shop/mensa-period-pants-pack-of-3">
                Shop period pants
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/** A simple front-on figure with the waist tape line. */
function BodyOutline() {
  return (
    <svg
      className="body"
      viewBox="0 0 290 360"
      role="img"
      aria-label="Where to measure: around the waist, at the narrowest point of the torso"
    >
      <defs>
        <linearGradient id="body-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--blush)" />
          <stop offset="1" stopColor="var(--blush-2)" />
        </linearGradient>
      </defs>
      <path
        className="body__shape"
        d="M104 18c-6 14-4 30 6 40-22 6-38 22-42 46-3 22 4 40 12 56-10 18-20 38-22 64-2 22 6 42 14 58l8 58h32l6-70h24l6 70h32l8-58c8-16 16-36 14-58-2-26-12-46-22-64 8-16 15-34 12-56-4-24-20-40-42-46 10-10 12-26 6-40-8-14-44-14-52 0Z"
        fill="url(#body-fill)"
      />
      {/* pant */}
      <path
        d="M70 214c40 10 80 10 120 0l4 22c-14 6-28 22-36 44h-56c-8-22-22-38-36-44Z"
        fill="var(--ink)"
        opacity=".88"
      />
      {/* waist tape */}
      <g className="tape tape--waist">
        <ellipse
          cx="130"
          cy="150"
          rx="52"
          ry="9"
          fill="none"
          stroke="var(--berry)"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />
        <line x1="182" y1="150" x2="226" y2="150" stroke="var(--berry)" strokeWidth="1.5" />
        <circle cx="182" cy="150" r="3.5" fill="var(--berry)" />
        <text x="230" y="154" fontSize="13" fontWeight="600" fill="var(--ink)">
          Waist
        </text>
      </g>
    </svg>
  )
}
