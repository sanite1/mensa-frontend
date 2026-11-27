// Home hero: the design system's full bleed slideshow with progress bars,
// pause, swipe, scroll parallax and mouse parallax on the product stage.
import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { initHero } from '@/lib/design/hero'
import pant from '@/assets/mensa-pant-5.png'
import pads from '@/assets/reuseable-pad.jpg'
import starter from '@/assets/sum_box.jpg'
import smile from '@/assets/hero-7.jpg'

const vars = (v: Record<string, string>) => v as CSSProperties

function Arrow() {
  return (
    <svg className="arrow" width="18" height="18">
      <use href="#i-arrow" />
    </svg>
  )
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => (ref.current ? initHero(ref.current) : undefined), [])

  return (
    <section ref={ref} className="xhero" aria-roledescription="carousel" aria-label="Featured">
      <div className="xhero__frame">
        {/* Slide 1 · products */}
        <article
          className="xslide xslide--shop is-active"
          data-theme="dark"
          aria-roledescription="slide"
          aria-label="1 of 3"
        >
          <div className="xslide__bg"></div>
          <div className="xstage">
            <div className="xarch" data-depth="10">
              <img src={pant} alt="Mensa reusable period pants in black" />
            </div>
            <div className="xpack" data-depth="26">
              <img src={pads} alt="Mensa reusable pads, five in a pack" />
            </div>
            <div className="xbadge" data-depth="18" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                </defs>
                <text>
                  <textPath href="#ring" textLength="272">
                    REUSABLE · LEAKPROOF · LASTS 2 YEARS ·
                  </textPath>
                </text>
              </svg>
              <i>
                <svg>
                  <use href="#i-drop" />
                </svg>
              </i>
            </div>
            <span
              className="xspec"
              data-depth="34"
              style={vars({ right: '-2%', top: '44%', '--fd': '0s' })}
            >
              <i>
                <svg>
                  <use href="#i-shield" />
                </svg>
              </i>
              Four layer leakproof
            </span>
            <span
              className="xspec"
              data-depth="30"
              style={vars({ right: '4%', bottom: '12%', '--fd': '-3s' })}
            >
              <i>
                <svg>
                  <use href="#i-clock" />
                </svg>
              </i>
              Holds flow for hours
            </span>
          </div>
          <div className="xslide__copy">
            <span className="xslide__kicker">Periods, but more convenient</span>
            <h1 className="xslide__title">
              <span className="xl">
                <span>Your one-stop</span>
              </span>
              <span className="xl">
                <span>
                  <em>menstrual health</em>
                </span>
              </span>
              <span className="xl">
                <span>shop.</span>
              </span>
            </h1>
            <p className="xslide__sub">
              Better periods start here. Discover thoughtfully designed reusable products, fun
              menstrual health education, and fashionable advocacy that puts women and girls first.
            </p>
            <div className="xslide__ctas">
              <Link className="btn" to="/find-my-starter-set">
                Find my starter set <Arrow />
              </Link>
              <Link className="btn btn--ghost" to="/how-it-works">
                How they work
              </Link>
            </div>
            <nav className="xshopby" aria-label="Shop by product">
              <Link to="/shop/mensa-period-pants-pack-of-3">
                <img src={pant} alt="" />
                Pants
              </Link>
              <Link to="/shop/reusable-pads">
                <img src={pads} alt="" />
                Pads
              </Link>
              <Link to="/shop/mensa-period-pants-pack-of-5">
                <img src={starter} alt="" />
                Pack of 5
              </Link>
            </nav>
          </div>
        </article>

        {/* Slide 2 · smile */}
        <article
          className="xslide xslide--smile"
          data-theme="light"
          aria-roledescription="slide"
          aria-label="2 of 3"
        >
          <img
            className="xslide__img"
            src={smile}
            alt="A smiling woman at the Mensa launch holding a Game Changer for Periods sign"
          />
          <div className="xslide__grade"></div>
          <div className="xslide__shade"></div>
          <div className="xslide__copy">
            <span className="xslide__kicker">Real women · Real smiles</span>
            <h2 className="xslide__title">
              <span className="xl">
                <span>Wear the smile</span>
              </span>
              <span className="xl">
                <span>of women who</span>
              </span>
              <span className="xl">
                <span>
                  <em>use Mensa.</em>
                </span>
              </span>
            </h2>
            <p className="xslide__sub">
              Soft, leakproof period pants you forget you're wearing. Join the women across Nigeria
              who never went back to disposables.
            </p>
            <div className="xslide__ctas">
              <Link className="btn btn--light" to="/shop/mensa-period-pants-pack-of-3">
                Shop period pants <Arrow />
              </Link>
              <Link className="btn btn--glass" to="/how-it-works">
                How it works
              </Link>
            </div>
          </div>
        </article>

        {/* Slide 3 · pack of 5 */}
        <article
          className="xslide"
          data-theme="light"
          aria-roledescription="slide"
          aria-label="3 of 3"
        >
          <img
            className="xslide__img"
            src={starter}
            alt="Mensa period pants packs being handed out"
            style={vars({ objectPosition: '55% 45%' })}
          />
          <div className="xslide__shade"></div>
          <div className="xslide__copy">
            <span className="xslide__kicker">Period Pants · Pack of 5</span>
            <h2 className="xslide__title">
              <span className="xl">
                <span>Switch once.</span>
              </span>
              <span className="xl">
                <span>
                  Skip <em>300+ disposables.</em>
                </span>
              </span>
            </h2>
            <p className="xslide__sub">
              Five pairs for light to heavy days, with a discreet storage bag. Each pair lasts up to
              two years with care.
            </p>
            <div className="xslide__ctas">
              <Link className="btn btn--light" to="/shop/mensa-period-pants-pack-of-5">
                Shop the pack of 5 <Arrow />
              </Link>
            </div>
          </div>
        </article>

        {/* Floating product card */}
        <Link className="xcard" to="/shop/mensa-period-pants-pack-of-5">
          <img src={starter} alt="" />
          <span>
            <small>Best value</small>
            <b>Pack of 5</b>
            <em>5 pants + storage bag</em>
          </span>
          <i>
            <svg width="16" height="16">
              <use href="#i-arrow" />
            </svg>
          </i>
        </Link>

        <a className="xhero__scroll" href="#after-hero" aria-label="Scroll to content">
          <span></span>
        </a>

        {/* Controls */}
        <div className="xhero__controls">
          <div className="xhero__bars">
            <button type="button" aria-label="Show slide 1">
              <span></span>
            </button>
            <button type="button" aria-label="Show slide 2">
              <span></span>
            </button>
            <button type="button" aria-label="Show slide 3">
              <span></span>
            </button>
          </div>
          <button type="button" className="xhero__pause" aria-label="Pause slideshow">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <rect className="p1" x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect className="p2" x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <path className="pl" d="M8 5l11 7-11 7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Trust strip */}
      <ul className="trust wrap" id="after-hero">
        <li>
          <i>
            <svg>
              <use href="#i-shield" />
            </svg>
          </i>
          Leakproof, four layer protection
        </li>
        <li>
          <i>
            <svg>
              <use href="#i-clock" />
            </svg>
          </i>
          Holds flow for hours
        </li>
        <li>
          <i>
            <svg>
              <use href="#i-leaf" />
            </svg>
          </i>
          Replaces 300+ disposables
        </li>
        <li>
          <i>
            <svg>
              <use href="#i-bag" />
            </svg>
          </i>
          Nationwide delivery from Abuja
        </li>
      </ul>
    </section>
  )
}
