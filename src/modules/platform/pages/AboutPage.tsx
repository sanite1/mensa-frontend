// /about: our story in the design system's layout. Every line of copy is
// word for word from the old about page; only the gallery is new.

import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { SplitHeading } from '@/components/design/SplitHeading'
import { useSeo } from '@/lib/seo'

import aboutHero from '@/assets/about-mensa.jpg'
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

const PILLARS = [
  {
    icon: 'i-shield',
    title: 'Dignified',
    body: 'Every woman deserves to manage her period with comfort, confidence and knowledge. We believe dignity begins with having the right products and the right information.',
  },
  {
    icon: 'i-leaf',
    title: 'Sustainable',
    body: 'A better period should not come at the expense of the planet. Our reusable products are designed to reduce waste while lasting for years (meaning more money in your pocket).',
  },
  {
    icon: 'i-clock',
    title: 'Convenient',
    body: 'Life is busy enough already. Mensa gives you reliable protection that fits seamlessly into work, school, travel and every part of your day.',
  },
]

const LAYERS = [
  'Soft inner layer: sits comfortably against your skin and keeps you feeling dry.',
  'Super absorbent core: locks in menstrual flow for hours without feeling bulky.',
  'Leakproof barrier: prevents leaks while remaining breathable and flexible.',
  'Durable outer fabric: washable, reusable and designed to last for years.',
]

export function AboutPage() {
  useSeo({
    title: 'Our story',
    description:
      'Mensa was founded by Kehinde Abereoje in Abuja, a public health advocate who turned a visit to a displaced persons camp at fourteen into a workshop, a brand, and an answer to period poverty in Nigeria.',
  })

  return (
    <main>
      <header className="info-hero">
        <div className="wrap">
          <span className="eyebrow">Our story</span>
          <h1 className="split">
            <span className="split-line">
              <span>We started with one belief:</span>
            </span>
            <span className="split-line">
              <span style={delay('.1s')}>
                periods should never be <span className="accent">a luxury.</span>
              </span>
            </span>
          </h1>
          <p className="lede">
            A letter from the founder, <b>Kehinde Abereoje</b>, about the girls she met at fourteen
            whose lives were affected by terrorism, and the solution she has spent nearly a decade
            building.
          </p>
          <a className="btn btn--ghost mt-6" href="#origin">
            Read the letter
          </a>
        </div>
      </header>

      <div className="wrap">
        <figure className="relative aspect-21/9 overflow-hidden rounded-(--r-lg)" data-reveal>
          <img
            src={aboutHero}
            alt="The Mensa team at a community event"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-(--ink)/75 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-6 pb-5 text-(--paper)">
            <span>
              <b className="block text-(length:--fs-h3) leading-none">2025</b>
              <small className="text-(length:--fs-xs) uppercase tracking-widest opacity-80">
                Founded
              </small>
            </span>
            <span className="text-right">
              <b className="block text-(length:--fs-h3) leading-none">Nationwide</b>
              <small className="text-(length:--fs-xs) uppercase tracking-widest opacity-80">
                Delivery, 2 to 5 days
              </small>
            </span>
          </figcaption>
        </figure>
      </div>

      {/* MISSION */}
      <section className="section section--blush">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Our mission
              </span>
              <SplitHeading
                lines={[
                  'To make periods dignified, sustainable and convenient',
                  'for every woman through the right products and knowledge.',
                ]}
              />
            </div>
          </div>
          <div className="about-pillars">
            {PILLARS.map((p, i) => (
              <article key={p.title} data-reveal style={i ? delay(`${i * 0.08}s`) : undefined}>
                <div className="reason__icon">
                  <svg>
                    <use href={`#${p.icon}`} />
                  </svg>
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ORIGIN */}
      <section className="section scroll-mt-20" id="origin">
        <div className="wrap founder">
          <div className="founder__img" data-reveal>
            <img data-parallax src={founderStudio} alt="Kehinde Abereoje at the Mensa studio" />
          </div>
          <div>
            <span className="eyebrow" data-reveal>
              The why
            </span>
            <h2 className="mt-4 text-(length:--fs-h3)" data-reveal>
              How a visit at fourteen became Mensa.
            </h2>
            <p data-reveal className="mt-5">
              At 14, Kehinde visited a camp for people who had been affected by terrorism in
              Northern Nigeria. It was the first time she truly understood that her world and theirs
              were miles apart, even though they were in the same city. Girls spoke about missing
              school because they had no period products, and she heard the unsafe alternatives they
              were forced to use instead.
            </p>
            <p data-reveal className="mt-4">
              At 16, she started a nonprofit with one goal: to make menstrual health education and
              period products more accessible to girls across Nigeria. For years, that work reached
              thousands of women and girls, but it also revealed a bigger truth. Charity could help
              in the moment, but it could not guarantee dignity for every girl.
            </p>
            <p data-reveal className="mt-4">
              That is why Mensa was created. We believe good period products should be comfortable,
              sustainable and accessible to all, so no woman has to rely on luck, donations or
              circumstance to manage her period.
            </p>
            <blockquote data-reveal>
              "We wanted to tackle some of the little things that have the biggest consequences."
            </blockquote>
            <cite data-reveal>Kehinde Abereoje, founder</cite>
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
              <SplitHeading lines={['Every product is designed', 'with you in mind.']} />
            </div>
            <p className="lede" data-reveal>
              At Mensa, we do not just design period products. We create thoughtful tools that make
              periods easier to understand, easier to manage and easier to talk about. From reusable
              period pants and pads to game cards, books and bold advocacy pieces, every product is
              designed with purpose.
            </p>
          </div>
          <ol className="about-timeline">
            {LAYERS.map((text, i) => {
              const [title, body] = text.split(': ')
              return (
                <li key={title} data-reveal>
                  <b>0{i + 1}</b>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              )
            })}
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
              The founder
            </span>
            <h2 className="mt-4 text-(length:--fs-h3)" data-reveal>
              Meet the mind behind Mensa.
            </h2>
            <span className="eyebrow mt-6" data-reveal>
              CEO, Mensa
            </span>
            <blockquote data-reveal>Kehinde Abereoje.</blockquote>
            <p data-reveal>
              Kehinde Abereoje is an award-winning social entrepreneur and public health
              professional who has spent almost a decade working to improve the lives of women and
              girls through menstrual health and gender equality.
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
              <SplitHeading lines={['One reusable period pant.', 'One reusable period pad.']} />
            </div>
          </div>
          <div className="impact">
            <div className="impact__item" data-reveal>
              <div className="impact__num" data-count="200" data-suffix="+">
                0
              </div>
              <p>Disposable pads replaced by one reusable period pant each year</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.1s')}>
              <div className="impact__num" data-count="4" data-suffix=" layers">
                0
              </div>
              <p>Wicking, absorbent core, leakproof membrane, outer shell</p>
            </div>
            <div className="impact__item" data-reveal style={delay('.2s')}>
              <div className="impact__num">
                ₦
                <span className="inline-block" data-count="40" data-suffix="k+">
                  0
                </span>
              </div>
              <p>Saved every year by switching to reusable period products</p>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIPS */}
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <div>
              <span className="eyebrow" data-reveal>
                Partnerships
              </span>
              <SplitHeading lines={['Schools, NGOs,', 'Governments.']} />
            </div>
            <div className="grid justify-items-start gap-5">
              <p className="lede" data-reveal>
                We are open to partnering with organisations, institutions and individuals who want
                to provide sustainable and dignified period care for girls in their communities.
                Eligible organisations receive discounted pricing on Mensa products.
              </p>
              <Link className="btn" to="/partnerships" data-reveal>
                Partner with Mensa <Arrow />
              </Link>
            </div>
          </div>
          <div className="gallery">
            <figure data-reveal>
              <img src={aboutHero} alt="The Mensa team at a community event" />
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

      {/* THE INVITATION */}
      <section className="section">
        <div className="wrap">
          <div className="banner" data-reveal>
            <img src={invitation} alt="" />
            <div className="banner__body">
              <div>
                <span className="eyebrow text-(--blush-2)">The invitation</span>
                <h2 className="mt-4">Switch once. Wear for many years.</h2>
                <p>
                  One reusable period pant can replace over 300 disposable pads during its lifetime.
                  One pack of five reusable pads can replace more than 1,500 disposable pads over
                  five years.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn--light" to="/find-my-starter-set">
                  Find my starter set <Arrow />
                </Link>
                <Link className="btn btn--glass" to="/journal">
                  Read the journal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
