// Story: the design's scroll driven six step how it works sequence.
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { initStory } from '@/lib/design/story'

export function Story() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => (ref.current ? initStory(ref.current) : undefined), [])
  return (
    <section ref={ref} className="story" aria-label="Six steps to using Mensa period pants">
      <div className="wrap story__sticky">
        <div className="story__text">
          <article className="story__panel is-active">
            <span className="step-no">Step 01 · Wear</span>
            <h2>Put it on. Forget about it.</h2>
            <p>
              Mensa period pants look and feel like your favourite underwear. No pads, no wings,
              nothing to change in the middle of the day.
            </p>
            <ul>
              <li>Sizes S to 3XL</li>
              <li>Breathable</li>
              <li>Hours of protection</li>
            </ul>
          </article>
          <article className="story__panel">
            <span className="step-no">Step 02 · Absorb</span>
            <h2>Four layers. Zero leaks.</h2>
            <p>
              A soft inner layer keeps you dry, a super absorbent core locks in flow for hours, and
              a leakproof barrier keeps it there.
            </p>
            <ul>
              <li>No bulk</li>
              <li>Feels dry</li>
              <li>Leakproof</li>
            </ul>
          </article>
          <article className="story__panel">
            <span className="step-no">Step 03 · Rinse</span>
            <h2>Rinse in cold water.</h2>
            <p>
              When you take them off, rinse under cold running water until it runs clear. Cold water
              stops stains from setting in.
            </p>
            <ul>
              <li>Cold water only</li>
              <li>Until it runs clear</li>
            </ul>
          </article>
          <article className="story__panel">
            <span className="step-no">Step 04 · Wash</span>
            <h2>Then wash, gently.</h2>
            <p>
              Machine wash on a cool 30°C cycle or hand wash with mild detergent. Skip fabric
              softener and bleach, because they clog the absorbent core.
            </p>
            <ul>
              <li>30°C</li>
              <li>Mild detergent</li>
              <li>No softener</li>
            </ul>
          </article>
          <article className="story__panel">
            <span className="step-no">Step 05 · Dry</span>
            <h2>Hang to air dry.</h2>
            <p>
              Line dry in the shade or indoors. No tumble dryer and no iron, so the leakproof layer
              lasts for years.
            </p>
            <ul>
              <li>Line dry</li>
              <li>No tumble dryer</li>
              <li>No iron</li>
            </ul>
          </article>
          <article className="story__panel">
            <span className="step-no">Step 06 · Repeat</span>
            <h2>Rotate. Repeat. For two years.</h2>
            <p>
              Three pants carry you through your period. One is on you, one is in the wash and one
              is dry and waiting, so you never run out.
            </p>
            <ul>
              <li>3 pants per cycle</li>
              <li>Replaces 300+ pads each</li>
            </ul>
          </article>
        </div>

        <div className="stage" aria-hidden="true">
          {/* 1 · WEAR */}
          <div className="scene is-active" data-scene="wear">
            <svg viewBox="0 0 400 400">
              <circle
                className="wear-ring"
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="var(--blush-2)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />
              <circle className="wear-ring" cx="200" cy="200" r="118" fill="#fff" opacity=".7" />
              <g className="wear-pant">
                <use href="#pant" x="80" y="112" width="240" height="180" />
              </g>
              <g>
                <circle
                  cx="300"
                  cy="118"
                  r="24"
                  fill="var(--berry)"
                  className="wear-ring"
                  style={{ transformOrigin: '300px 118px' } as CSSProperties}
                />
                <path
                  className="wear-tick"
                  d="M289 118l8 8 15-16"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
            <span className="scene__caption">
              Fits like your <b>everyday underwear</b>
            </span>
          </div>

          {/* 2 · LAYERS */}
          <div className="scene" data-scene="layers">
            <div className="layers layers--split">
              <div className="layers__stack">
                <div className="layer layer--outer" data-i="0"></div>
                <div className="layer layer--barrier" data-i="1"></div>
                <div className="layer layer--core" data-i="2"></div>
                <div className="layer layer--inner" data-i="3"></div>
              </div>
            </div>
            <div className="drops">
              <span className="drop"></span>
              <span
                className="drop"
                style={{ '--dd': '-.7s', marginLeft: '-22px' } as CSSProperties}
              ></span>
              <span
                className="drop"
                style={{ '--dd': '-1.4s', marginLeft: '8px' } as CSSProperties}
              ></span>
            </div>
            <ol className="layers__legend">
              <li data-i="3">
                <i
                  style={
                    {
                      background: 'var(--blush)',
                      boxShadow: 'inset 0 0 0 1px rgba(42,11,22,.15)',
                    } as CSSProperties
                  }
                ></i>
                <b>Soft inner layer</b>
                <span>Sits against your skin and keeps you feeling dry.</span>
              </li>
              <li data-i="2">
                <i style={{ background: 'var(--pink)' } as CSSProperties}></i>
                <b>Super absorbent core</b>
                <span>Locks in flow for hours without feeling bulky.</span>
              </li>
              <li data-i="1">
                <i style={{ background: 'var(--berry)' } as CSSProperties}></i>
                <b>Leakproof barrier</b>
                <span>Stops leaks while staying breathable and flexible.</span>
              </li>
              <li data-i="0">
                <i style={{ background: 'var(--ink)' } as CSSProperties}></i>
                <b>Durable outer fabric</b>
                <span>Washable, reusable and built to last for years.</span>
              </li>
            </ol>
          </div>

          {/* 3 · RINSE */}
          <div className="scene" data-scene="rinse">
            <svg viewBox="0 0 400 400">
              {/* tap */}
              <path
                d="M96 52 H196 a14 14 0 0 1 14 14 V78"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="120" y="30" width="34" height="12" rx="6" fill="var(--berry)" />
              <rect x="133" y="38" width="8" height="14" fill="var(--ink)" />
              {/* stream */}
              <line
                x1="210"
                y1="86"
                x2="210"
                y2="262"
                stroke="#BFE3EE"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <line
                className="stream"
                x1="210"
                y1="86"
                x2="210"
                y2="262"
                stroke="#7FC4DA"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* basin back */}
              <ellipse cx="200" cy="250" rx="140" ry="34" fill="#F1E4E8" />
              {/* pant in basin */}
              <use href="#pant" x="138" y="208" width="124" height="93" />
              {/* water */}
              <ellipse cx="200" cy="262" rx="124" ry="25" fill="#D8EEF4" opacity=".82" />
              <ellipse
                className="rinse-tint"
                cx="200"
                cy="262"
                rx="124"
                ry="25"
                fill="var(--pink-deep)"
                style={{ mixBlendMode: 'multiply' } as CSSProperties}
              />
              <ellipse
                className="ripple"
                cx="210"
                cy="260"
                rx="34"
                ry="8"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
              <ellipse
                className="ripple"
                cx="210"
                cy="260"
                rx="34"
                ry="8"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                style={{ '--rd': '-.8s' } as CSSProperties}
              />
              <ellipse
                className="ripple"
                cx="210"
                cy="260"
                rx="34"
                ry="8"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                style={{ '--rd': '-1.6s' } as CSSProperties}
              />
              {/* basin front */}
              <path
                d="M60 250 Q60 344 200 348 Q340 344 340 250 Q340 284 200 284 Q60 284 60 250 Z"
                fill="#fff"
                stroke="rgba(42,11,22,.08)"
                strokeWidth="2"
              />
              <path
                d="M92 300 Q140 330 200 332"
                fill="none"
                stroke="var(--blush)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <span className="scene__caption">
              Rinse in <b>cold water</b> until it runs clear
            </span>
          </div>

          {/* 4 · WASH */}
          <div className="scene" data-scene="wash">
            <svg viewBox="0 0 400 400">
              <defs>
                <clipPath id="door">
                  <circle cx="200" cy="232" r="78" />
                </clipPath>
              </defs>
              <rect
                x="86"
                y="44"
                width="228"
                height="310"
                rx="30"
                fill="#fff"
                stroke="rgba(42,11,22,.08)"
                strokeWidth="2"
              />
              <line
                x1="86"
                y1="112"
                x2="314"
                y2="112"
                stroke="rgba(42,11,22,.08)"
                strokeWidth="2"
              />
              <rect x="110" y="68" width="70" height="22" rx="11" fill="var(--blush)" />
              <text
                x="145"
                y="84"
                textAnchor="middle"
                fontFamily="Matter, Figtree, sans-serif"
                fontSize="13"
                fontWeight="600"
                fill="var(--berry)"
              >
                30°C
              </text>
              <circle cx="198" cy="79" r="4" fill="var(--pink)" />
              <circle cx="212" cy="79" r="4" fill="var(--blush-2)" />
              <circle cx="226" cy="79" r="4" fill="var(--blush-2)" />
              <g className="dial">
                <circle cx="276" cy="79" r="17" fill="var(--ink)" />
                <line
                  x1="276"
                  y1="79"
                  x2="276"
                  y2="66"
                  stroke="var(--pink)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
              <circle cx="200" cy="232" r="94" fill="#F6EEF0" />
              <circle cx="200" cy="232" r="86" fill="none" stroke="var(--ink)" strokeWidth="8" />
              <g clipPath="url(#door)">
                <rect x="110" y="140" width="180" height="190" fill="#E6F3F7" />
                <path d="M110 250 Q155 236 200 250 T290 250 V330 H110 Z" fill="#CBE8F1" />
                <g className="drum">
                  <rect x="122" y="154" width="156" height="156" fill="none" />
                  <use href="#pant" x="148" y="196" width="104" height="78" />
                  <circle cx="160" cy="180" r="4" fill="#fff" />
                  <circle cx="244" cy="290" r="5" fill="#fff" />
                </g>
                <circle className="bubble" cx="160" cy="300" r="7" fill="#fff" stroke="#BFE3EE" />
                <circle
                  className="bubble"
                  cx="215"
                  cy="306"
                  r="5"
                  fill="#fff"
                  stroke="#BFE3EE"
                  style={{ '--bd': '-1s' } as CSSProperties}
                />
                <circle
                  className="bubble"
                  cx="245"
                  cy="296"
                  r="9"
                  fill="#fff"
                  stroke="#BFE3EE"
                  style={{ '--bd': '-2s' } as CSSProperties}
                />
                <circle
                  className="bubble"
                  cx="185"
                  cy="310"
                  r="4"
                  fill="#fff"
                  stroke="#BFE3EE"
                  style={{ '--bd': '-1.5s' } as CSSProperties}
                />
              </g>
              <path
                d="M150 180 Q170 162 196 158"
                fill="none"
                stroke="#fff"
                strokeWidth="6"
                strokeLinecap="round"
                opacity=".8"
              />
            </svg>
            <span className="scene__caption">
              Cool <b>30°C</b> wash · no softener, no bleach
            </span>
          </div>

          {/* 5 · DRY */}
          <div className="scene" data-scene="dry">
            <svg viewBox="0 0 400 400">
              <g transform="translate(318 82)">
                <g className="sun-rays">
                  <g stroke="#FFB55E" strokeWidth="4" strokeLinecap="round">
                    <line x1="0" y1="-44" x2="0" y2="-34" />
                    <line x1="0" y1="44" x2="0" y2="34" />
                    <line x1="-44" y1="0" x2="-34" y2="0" />
                    <line x1="44" y1="0" x2="34" y2="0" />
                    <line x1="-31" y1="-31" x2="-24" y2="-24" />
                    <line x1="31" y1="31" x2="24" y2="24" />
                    <line x1="-31" y1="31" x2="-24" y2="24" />
                    <line x1="31" y1="-31" x2="24" y2="-24" />
                  </g>
                </g>
                <circle r="24" fill="#FFC46B" />
              </g>
              <path
                className="breeze"
                d="M20 300 Q110 280 200 300 T380 300"
                fill="none"
                stroke="var(--blush-2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                className="breeze"
                d="M20 340 Q110 320 200 340 T380 340"
                fill="none"
                stroke="var(--blush-2)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ '--bz': '-1.4s' } as CSSProperties}
              />
              <line
                x1="40"
                y1="110"
                x2="40"
                y2="380"
                stroke="var(--ink)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1="360"
                y1="110"
                x2="360"
                y2="380"
                stroke="var(--ink)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M40 120 Q200 140 360 120"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="2.5"
              />
              <g className="swing">
                <use href="#pant" x="116" y="122" width="168" height="126" />
                <rect x="146" y="118" width="10" height="24" rx="3" fill="var(--pink)" />
                <rect x="244" y="118" width="10" height="24" rx="3" fill="var(--pink)" />
                <circle className="drip-off" cx="200" cy="252" r="4" fill="#7FC4DA" />
                <circle
                  className="drip-off"
                  cx="188"
                  cy="250"
                  r="3"
                  fill="#7FC4DA"
                  style={{ '--dd': '-.9s' } as CSSProperties}
                />
              </g>
            </svg>
            <span className="scene__caption">
              Hang to <b>air dry</b> · no tumble dryer, no iron
            </span>
          </div>

          {/* 6 · REPEAT */}
          <div className="scene" data-scene="repeat">
            <div className="rotation">
              <div className="rotation__ring">
                <div className="token">
                  <svg viewBox="0 0 240 180">
                    <use href="#pant" />
                  </svg>
                  <b>1</b>
                </div>
                <div className="token">
                  <svg
                    viewBox="0 0 240 180"
                    style={{ '--pant': 'var(--berry)', '--band': '#6e1736' } as CSSProperties}
                  >
                    <use href="#pant" />
                  </svg>
                  <b>2</b>
                </div>
                <div className="token">
                  <svg
                    viewBox="0 0 240 180"
                    style={
                      {
                        '--pant': 'var(--berry)',
                        '--band': '#9c1d44',
                        '--gusset': 'var(--blush-2)',
                      } as CSSProperties
                    }
                  >
                    <use href="#pant" />
                  </svg>
                  <b>3</b>
                </div>
              </div>
              <div className="rotation__center">
                <b>3 pants</b>
                <span>carry your whole period</span>
              </div>
              <span className="rotation__label rotation__label--top">
                <i>
                  <svg>
                    <use href="#i-user" />
                  </svg>
                </i>
                On you
              </span>
              <span className="rotation__label rotation__label--br">
                <i>
                  <svg>
                    <use href="#i-drop" />
                  </svg>
                </i>
                In the wash
              </span>
              <span className="rotation__label rotation__label--bl">
                <i>
                  <svg>
                    <use href="#i-clock" />
                  </svg>
                </i>
                Dry &amp; waiting
              </span>
            </div>
          </div>
        </div>

        <div className="story__rail">
          <button aria-label="Step 1: Wear">
            <span></span>
          </button>
          <button aria-label="Step 2: Absorb">
            <span></span>
          </button>
          <button aria-label="Step 3: Rinse">
            <span></span>
          </button>
          <button aria-label="Step 4: Wash">
            <span></span>
          </button>
          <button aria-label="Step 5: Dry">
            <span></span>
          </button>
          <button aria-label="Step 6: Repeat">
            <span></span>
          </button>
          <span className="story__counter">01 / 06</span>
        </div>
      </div>
    </section>
  )
}
