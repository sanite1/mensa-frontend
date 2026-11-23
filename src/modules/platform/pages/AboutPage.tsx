// /about: our story in the design system's layout. The design's sections
// (hero, founder, pillars, timeline, gallery, banner) carry our own copy:
// the origin letter, mission, the four layers, the founder bio, impact
// numbers and partnerships.

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { SplitHeading } from '@/components/design/SplitHeading'
import { useSeo } from '@/lib/seo'

import community from '@/assets/about-mensa.jpg'
import founderPortrait from '@/assets/kenny-1.jpg'
import founderStudio from '@/assets/kenny-000.jpg'
import packOfThree from '@/assets/mensa-pant-5.png'
import myCycoo from '@/assets/my-cycoo.jpg'
import workshop from '@/assets/sum_box.jpg'
import invitation from '@/assets/invitation.jpg'

const delay = (d: string) => ({ '--d': d }) as CSSProperties

const Arrow = () => (
  <svg className="arrow" width="18" height="18">
    <use href="#i-arrow" />
  </svg>
)

export function AboutPage() {
  useSeo({
    title: 'Our story',
    description:
      'Mensa was founded by Kehinde Abereoje in Abuja, a public health advocate who turned a visit to a displaced persons camp at fourteen into a nonprofit, a brand, and an answer to period poverty in Nigeria.',
  })

  return (
    <main>
      <header className="info-hero">
        <div className="wrap">
          <span className="eyebrow">Our story</span>
          <h1 className="split">
            <span className="split-line">
              <span>Periods should never</span>
            </span>
            <span className="split-line">
              <span style={delay('.1s')}>
                be <span className="accent">a luxury.</span>
              </span>
            </span>
          </h1>
          <p className="lede">
            A letter from our founder, Kehinde Abereoje, about the girls she met at fourteen whose
            lives were affected by terrorism, and the solution she has spent nearly a decade
            building.
          </p>
        </div>
      </header>

      {/* ORIGIN */}
      <section className="section" id="origin">
        <div className="wrap founder">
          <div className="founder__img" data-reveal>
            <img data-parallax src={founderStudio} alt="Kehinde Abereoje at the Mensa studio" />
          </div>
          <div>
            <span className="eyebrow" data-reveal>
              How a visit at fourteen became Mensa
            </span>
            <blockquote data-reveal>
              We wanted to tackle some of the little things that have the biggest consequences.
            </blockquote>
            <p data-reveal>
              At 14, Kehinde visited a camp for people who had been affected by terrorism in
              Northern Nigeria. Girls spoke about missing school because they had no period
              products, and she heard the unsafe alternatives they were forced to use instead.
            </p>
            <p data-reveal className="mt-4">
              At 16, she started a nonprofit to make menstrual health education and period products
              more accessible to girls across Nigeria. That work reached thousands of women and
              girls, but it also revealed a bigger truth: charity could help in the moment, but it
              could not guarantee dignity for every girl.
            </p>
            <p data-reveal className="mt-4">
              That is why Mensa was created. Good period products should be comfortable, sustainable
              and accessible to all, so no woman has to rely on luck, donations or circumstance to
              manage her period.
            </p>
            <cite data-reveal>
              <b>Kehinde Abereoje</b> · Founder, Mensa Period Products
            </cite>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="section section--blush">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Our mission
              </span>
              <SplitHeading lines={['Dignified, sustainable', 'and convenient.']} />
            </div>
            <p className="lede" data-reveal>
              To make periods dignified, sustainable and convenient for every woman through the
              right products and knowledge.
            </p>
          </div>
          <div className="about-pillars">
            <article data-reveal>
              <div className="reason__icon">
                <svg>
                  <use href="#i-shield" />
                </svg>
              </div>
              <h3>Dignified</h3>
              <p>
                Every woman deserves to manage her period with comfort, confidence and knowledge.
                Dignity begins with having the right products and the right information.
              </p>
              <Link className="btn btn--ghost mt-2.5 justify-self-start" to="/shop">
                Shop <Arrow />
              </Link>
            </article>
            <article data-reveal style={delay('.08s')}>
              <div className="reason__icon">
                <svg>
                  <use href="#i-leaf" />
                </svg>
              </div>
              <h3>Sustainable</h3>
              <p>
                A better period should not cost the planet. Our reusable products reduce waste while
                lasting for years, which means more money in your pocket.
              </p>
              <Link className="btn btn--ghost mt-2.5 justify-self-start" to="/how-it-works">
                How it works <Arrow />
              </Link>
            </article>
            <article data-reveal style={delay('.16s')}>
              <div className="reason__icon">
                <svg>
                  <use href="#i-clock" />
                </svg>
              </div>
              <h3>Convenient</h3>
              <p>
                Life is busy enough already. Mensa gives you reliable protection that fits into
                work, school, travel and every part of your day.
              </p>
              <Link className="btn btn--ghost mt-2.5 justify-self-start" to="/find-my-starter-set">
                Find my starter set <Arrow />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* PRODUCT DESIGN */}
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Product design
              </span>
              <SplitHeading lines={['Designed with', 'you in mind.']} />
            </div>
            <p className="lede" data-reveal>
              From reusable period pants and pads to game cards, books and bold advocacy pieces,
              every product makes periods easier to understand, manage and talk about.
            </p>
          </div>
          <ol className="about-timeline">
            <li data-reveal>
              <b>Layer 1</b>
              <div>
                <h3>Soft inner layer</h3>
                <p>Sits comfortably against your skin and keeps you feeling dry.</p>
              </div>
            </li>
            <li data-reveal>
              <b>Layer 2</b>
              <div>
                <h3>Super absorbent core</h3>
                <p>Locks in menstrual flow for hours without feeling bulky.</p>
              </div>
            </li>
            <li data-reveal>
              <b>Layer 3</b>
              <div>
                <h3>Leakproof barrier</h3>
                <p>Prevents leaks while remaining breathable and flexible.</p>
              </div>
            </li>
            <li data-reveal>
              <b>Layer 4</b>
              <div>
                <h3>Durable outer fabric</h3>
                <p>Washable, reusable and designed to last for years.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="section section--blush">
        <div className="wrap founder">
          <div className="founder__img" data-reveal>
            <img
              data-parallax
              src={founderPortrait}
              alt="Kehinde Abereoje, founder of Mensa Period Products"
            />
          </div>
          <div>
            <span className="eyebrow" data-reveal>
              Meet the mind behind Mensa
            </span>
            <blockquote data-reveal>Kehinde Abereoje, CEO.</blockquote>
            <p data-reveal>
              Kehinde is an award winning social entrepreneur and public health professional who has
              spent almost a decade improving the lives of women and girls through menstrual health
              and gender equality.
            </p>
            <p data-reveal className="mt-4">
              She is building sustainable period care that is accessible, practical and proudly
              African. Kehinde holds a BSc in Public Health from Babcock University, an MPhil in
              Population Health Sciences from the University of Cambridge, and is an MBA candidate
              at the University of Oxford.
            </p>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="section section--ink">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                The impact
              </span>
              <SplitHeading lines={['One reusable pant.', 'One reusable pad.']} />
            </div>
          </div>
          <div className="impact">
            <div className="impact__item" data-reveal>
              <div className="impact__num" data-count="200" data-suffix="+">
                0
              </div>
              <p>Disposable pads replaced by one reusable period pant each year.</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.1s')}>
              <div className="impact__num" data-count="4" data-suffix=" layers">
                0
              </div>
              <p>Wicking top, absorbent core, leakproof membrane and outer shell.</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.2s')}>
              <div className="impact__num">
                ₦
                <span className="inline-block" data-count="40" data-suffix="k+">
                  0
                </span>
              </div>
              <p>Saved every year by switching to reusable period products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section">
        <div className="wrap">
          <div className="gallery">
            <figure data-reveal>
              <img src={community} alt="The Mensa team at a community event" />
              <figcaption>Mensa launch · Abuja</figcaption>
            </figure>
            <figure data-reveal style={delay('.08s')}>
              <img src={packOfThree} alt="Mensa reusable period pants, pack of three" />
              <figcaption>Period pants</figcaption>
            </figure>
            <figure data-reveal style={delay('.16s')}>
              <img src={myCycoo} alt="My Cycoo period education guide cover" />
              <figcaption>My Cycoo</figcaption>
            </figure>
            <figure data-reveal style={delay('.24s')}>
              <img src={invitation} alt="Guests arriving at a Mensa event" />
              <figcaption>Our community</figcaption>
            </figure>
            <figure data-reveal style={delay('.32s')}>
              <img src={workshop} alt="Mensa reusable period products being prepared" />
              <figcaption>Packed in Abuja</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS + INVITATION */}
      <section className="section">
        <div className="wrap">
          <div className="banner" data-reveal>
            <img src={invitation} alt="" />
            <div className="banner__body">
              <div>
                <span className="eyebrow text-(--blush-2)">Schools, NGOs, governments</span>
                <h2 className="mt-4">Switch once, or help a girl make the switch.</h2>
                <p>
                  One reusable period pant can replace over 300 disposable pads during its lifetime.
                  We also partner with organisations who want to bring dignified period care to
                  girls in their communities, at discounted prices.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn--light" to="/find-my-starter-set">
                  Find my starter set <Arrow />
                </Link>
                <Link className="btn btn--glass" to="/partnerships">
                  Partner with Mensa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
