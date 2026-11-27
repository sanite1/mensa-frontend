// /how-it-works: ported from the design repo. Scroll story, savings calculator, care guide, FAQ.
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Story } from '@/components/design/Story'
import { Calculator } from '@/components/design/Calculator'
import { useSeo } from '@/lib/seo'

export function HowItWorksPage() {
  useSeo({
    title: 'How it works',
    description:
      'How Mensa reusable period pants work: wear, absorb, rinse, wash, dry, repeat. Care guide, savings calculator and FAQ.',
  })
  return (
    <main>
      {/* HERO */}
      <section className="hiw-hero">
        <div className="wrap split">
          <span className="eyebrow">How it works</span>
          <h1>
            <span className="split-line">
              <span>Wear. Rinse.</span>
            </span>
            <span className="split-line">
              <span style={{ '--d': '.12s' } as CSSProperties}>
                Wash. <span className="accent">Repeat.</span>
              </span>
            </span>
          </h1>
          <p className="lede" data-reveal style={{ '--d': '.3s' } as CSSProperties}>
            Everything you need to know about reusable period pants, in six easy steps. Keep
            scrolling to watch.
          </p>
          <div className="scroll-cue" aria-hidden="true"></div>
        </div>
      </section>

      <Story />

      {/* CALCULATOR */}
      <section className="section section--blush">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Do the maths
              </span>
              <h2 className="split">
                <span className="split-line">
                  <span>Pads are a</span>
                </span>
                <span className="split-line">
                  <span style={{ '--d': '.1s' } as CSSProperties}>subscription.</span>
                </span>
              </h2>
            </div>
            <p className="lede" data-reveal>
              Count what you spend on disposable pads every month. Then see what it adds up to.
            </p>
          </div>
          <Calculator />
        </div>
      </section>

      {/* CARE */}
      <section className="section" id="care">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Care guide
              </span>
              <h2 className="split">
                <span className="split-line">
                  <span>Made to last.</span>
                </span>
                <span className="split-line">
                  <span style={{ '--d': '.1s' } as CSSProperties}>Treat them well.</span>
                </span>
              </h2>
            </div>
            <p className="lede" data-reveal>
              How to wash, dry and care for your Mensa reusables so they last for years.
            </p>
          </div>
          <div className="care">
            <div className="care__col" data-reveal>
              <h3>
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </i>
                Do
              </h3>
              <ul>
                <li>
                  Rinse in cold water straight after wearing <span>Step 1</span>
                </li>
                <li>
                  Wash at 30°C or by hand with mild detergent <span>Step 2</span>
                </li>
                <li>
                  Line dry in the shade or indoors <span>Step 3</span>
                </li>
                <li>
                  Carry used ones home in a wet bag <span>On the go</span>
                </li>
              </ul>
            </div>
            <div
              className="care__col care__col--dont"
              data-reveal
              style={{ '--d': '.1s' } as CSSProperties}
            >
              <h3>
                <i>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </i>
                Don't
              </h3>
              <ul>
                <li>
                  Use hot water for the first rinse <span>Sets stains</span>
                </li>
                <li>
                  Add fabric softener or bleach <span>Clogs the core</span>
                </li>
                <li>
                  Tumble dry or iron <span>Damages the barrier</span>
                </li>
                <li>
                  Leave them unwashed for long <span>Rinse the same day</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="tip" style={{ marginTop: '1.2rem' } as CSSProperties} data-reveal>
            <div className="tip__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="8" width="20" height="8" rx="2" />
                <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
              </svg>
            </div>
            <div>
              <h3>On the boundary between two sizes? Size up.</h3>
              <p>
                The pant should feel like a hug, not a squeeze, so the absorbent layer stays close
                to your skin.
              </p>
            </div>
            <Link className="btn" to="/size-guide">
              Size guide{' '}
              <svg className="arrow" width="18" height="18">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--blush" id="faq">
        <div className="wrap">
          <div
            className="section__head"
            style={{ justifyContent: 'center', textAlign: 'center' } as CSSProperties}
          >
            <div>
              <span className="eyebrow" data-reveal>
                Questions
              </span>
              <h2 className="split" style={{ marginInline: 'auto' } as CSSProperties}>
                <span className="split-line">
                  <span>Good to know.</span>
                </span>
              </h2>
            </div>
          </div>
          <div className="faq" data-reveal>
            <details open>
              <summary>
                How long can I wear them for?<i></i>
              </summary>
              <p className="faq__a">
                Everyone's flow is different, so wear them at home first to learn your rhythm. The
                super absorbent core locks in flow for hours, and one pant covers your heaviest day
                and night. Pair them with reusable pads on your lighter days.
              </p>
            </details>
            <details>
              <summary>
                Will I feel wet or bulky?<i></i>
              </summary>
              <p className="faq__a">
                No. The soft inner layer sits against your skin and keeps you feeling dry, and the
                absorbent core is designed to hold flow without feeling bulky.
              </p>
            </details>
            <details>
              <summary>
                How many pants do I need?<i></i>
              </summary>
              <p className="faq__a">
                Three pants can carry you through your period. One is on you, one is washed and one
                is dry and waiting, so you do not run out in the middle. Add pads for the light days
                at the start and end. The pack of 3 has you covered.
              </p>
            </details>
            <details>
              <summary>
                What if I'm out when I need to change?<i></i>
              </summary>
              <p className="faq__a">
                Fold the used pant, pop it in a wet bag, and rinse it in cold water as soon as you
                get home.
              </p>
            </details>
            <details>
              <summary>
                Can I return them?<i></i>
              </summary>
              <p className="faq__a">
                For hygiene reasons we do not accept returns or exchanges on period products. Wrong,
                damaged, or wrong size items reported within three days of delivery, we make right.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="wrap center-cta split">
          <span className="eyebrow">Ready?</span>
          <h2>
            <span className="split-line">
              <span>Switch once.</span>
            </span>
            <span className="split-line">
              <span style={{ '--d': '.1s' } as CSSProperties}>
                Skip <span className="accent">300+ disposables.</span>
              </span>
            </span>
          </h2>
          <p className="lede" data-reveal>
            Answer 8 quick questions and we will tell you which Mensa reusable period products to
            start with.
          </p>
          <div className="hero__ctas" data-reveal>
            <Link className="btn" to="/shop/mensa-period-pants-pack-of-3">
              Shop the pack of 3{' '}
              <svg className="arrow" width="18" height="18">
                <use href="#i-arrow" />
              </svg>
            </Link>
            <Link className="btn btn--ghost" to="/find-my-starter-set">
              Find my starter set
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
