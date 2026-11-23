import { Link } from 'react-router-dom'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import {
  CHART_MAX_IN,
  CHART_MIN_IN,
  fromInches,
  PANT_SIZES,
  type PantSize,
  range,
  recommendSize,
  SIZE_EMAIL,
  SIZE_TABLE,
  sizesFor,
  toInches,
  type Unit,
} from '@/lib/design/sizes'

export function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <div className="unit" role="group" aria-label="Units">
      {(['in', 'cm'] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          className={unit === u ? 'is-on' : ''}
          onClick={() => onChange(u)}
        >
          {u === 'cm' ? 'cm' : 'inches'}
        </button>
      ))}
    </div>
  )
}

/** Mensa's size chart: waist only. Highlights the recommended row. */
export function SizeTable({
  highlight,
  compact,
}: {
  unit?: Unit
  highlight?: PantSize | null
  compact?: boolean
}) {
  return (
    <div className="sizetable-wrap">
      <table className={`sizetable${compact ? ' sizetable--compact' : ''}`}>
        <caption className="sr-only">Period pant sizes by waist measurement</caption>
        <thead>
          <tr>
            <th scope="col">Size</th>
            <th scope="col">Waist (in)</th>
            <th scope="col">Waist (cm)</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_TABLE.map((r) => (
            <tr
              key={r.size}
              className={highlight === r.size ? 'is-match' : ''}
              aria-current={highlight === r.size ? 'true' : undefined}
            >
              <th scope="row">
                {r.size}
                {highlight === r.size && <span className="sizetable__you">You</span>}
              </th>
              {r.waist ? (
                <>
                  <td>{range(r.waist, 'in')}&quot;</td>
                  <td>{range(r.waist, 'cm')}</td>
                </>
              ) : (
                <td colSpan={2} className="sizetable__ask">
                  Above {CHART_MAX_IN}&quot;:{' '}
                  <a href={`mailto:${SIZE_EMAIL}?subject=Size%20advice`}>email us</a> and we&apos;ll
                  recommend a size
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="sizetable__unit">
        The ranges overlap on purpose. If you&apos;re in two, size up.
      </p>
    </div>
  )
}

/**
 * A waist measurement in, a size out. `onSelect` adds a "Select M" button
 * (product page and quiz); `shopLink` adds "Shop period pants in M".
 */
export function SizeCalculator({
  unit,
  onUnit,
  onResult,
  onSelect,
  selectLabel,
  shopLink,
}: {
  unit: Unit
  onUnit?: (u: Unit) => void
  onResult?: (size: PantSize | null) => void
  onSelect?: (size: PantSize) => void
  selectLabel?: (size: PantSize) => string
  shopLink?: boolean
}) {
  const [waist, setWaist] = useState('')
  const parse = (v: string) => {
    const n = Number(v.replace(',', '.'))
    return v !== '' && Number.isFinite(n) && n > 0 ? toInches(n, unit) : NaN
  }
  const rec = recommendSize(parse(waist))

  const change = (v: string) => {
    setWaist(v)
    onResult?.(recommendSize(parse(v))?.size ?? null)
  }

  const switchUnit = (u: Unit) => {
    if (u === unit) return
    // Keep the number the person typed meaningful in the new unit.
    const n = Number(waist.replace(',', '.'))
    if (waist && Number.isFinite(n)) setWaist(String(fromInches(toInches(n, unit), u)))
    onUnit?.(u)
  }

  const reset = () => change('')

  return (
    <div className="sf">
      <div className="sf__head">
        <div>
          <h3>Find your size</h3>
          <p>Measure over underwear, tape snug but not tight.</p>
        </div>
        {onUnit && <UnitToggle unit={unit} onChange={switchUnit} />}
      </div>
      <div className="sf__fields sf__fields--one">
        <MeasureField
          label="Waist"
          hint="Wrap a soft tape around the narrowest part of your waist."
          unit={unit}
          value={waist}
          onChange={change}
        />
      </div>
      <div className={`sf__result${rec ? ' is-ready' : ''}`} aria-live="polite">
        {rec ? (
          <>
            <div className="sf__size">
              <small>Your size</small>
              <b key={rec.size}>{rec.offChart ? '2XL+' : rec.size}</b>
            </div>
            <div className="sf__why">
              <p>{rec.note}</p>
              <div className="sf__actions">
                {rec.offChart ? (
                  <a
                    className="btn"
                    href={`mailto:${SIZE_EMAIL}?subject=Size%20advice&body=My%20waist%20is%20${encodeURIComponent(waist)}${unit === 'in' ? '%20inches' : '%20cm'}.`}
                  >
                    Email for size advice
                  </a>
                ) : (
                  <>
                    {onSelect && (
                      <button type="button" className="btn" onClick={() => onSelect(rec.size)}>
                        {selectLabel ? selectLabel(rec.size) : `Select ${rec.size}`}
                      </button>
                    )}
                    {shopLink && (
                      <>
                        <Link
                          className={onSelect ? 'sf__link' : 'btn'}
                          to="/shop/mensa-period-pants-pack-of-3"
                        >
                          Shop the pack of 3 in {rec.size}{' '}
                          <svg className="arrow" width="18" height="18">
                            <use href="#i-arrow" />
                          </svg>
                        </Link>
                        <Link className="sf__link" to="/shop/period-pants-singles">
                          or try a single
                        </Link>
                      </>
                    )}
                  </>
                )}
                <button type="button" className="sf__reset" onClick={reset}>
                  Start again
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="sf__empty">
            <span className="sf__empty-icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
              >
                <rect x="2" y="8" width="20" height="8" rx="2" />
                <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
              </svg>
            </span>
            <p>
              Add your waist measurement and we&apos;ll match your size. In two sizes? We&apos;ll
              size you up.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ the waist field */

/** Slider span, in inches: a little past the chart on both ends. */
const SPAN = { min: 22, max: 52, start: 32 }
const stepFor = (unit: Unit) => (unit === 'cm' ? 1 : 0.5)
const fmt = (n: number, unit: Unit) =>
  unit === 'cm' ? String(Math.round(n)) : String(Math.round(n * 2) / 2)

/** Which size this waist points to, in words. */
function band(inches: number) {
  if (inches < CHART_MIN_IN)
    return {
      tone: 'edge',
      text: (
        <>
          Under {CHART_MIN_IN}&quot;: <b>S</b> is the snuggest fit we make.
        </>
      ),
    }
  if (inches > CHART_MAX_IN)
    return {
      tone: 'edge',
      text: (
        <>
          Over {CHART_MAX_IN}&quot;: <b>2XL or 3XL</b>. Email us and we&apos;ll recommend one.
        </>
      ),
    }
  const fits = sizesFor(inches)
  if (fits.length === 1) {
    const row = SIZE_TABLE.find((r) => r.size === fits[0])!
    return {
      tone: 'ok',
      text: (
        <>
          Fits <b>{fits[0]}</b> · {range(row.waist!, 'in')}&quot;
        </>
      ),
    }
  }
  return {
    tone: 'between',
    text: (
      <>
        In {fits.join(' and ')}: size up to <b>{fits[fits.length - 1]}</b>
      </>
    ),
  }
}

function MeasureField({
  label,
  hint,
  unit,
  value,
  onChange,
}: {
  label: string
  hint: string
  unit: Unit
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  const min = fromInches(SPAN.min, unit)
  const max = fromInches(SPAN.max, unit)
  const step = stepFor(unit)
  const n = Number(value.replace(',', '.'))
  const has = value !== '' && Number.isFinite(n) && n > 0
  const current = has ? n : fromInches(SPAN.start, unit)
  const b = has ? band(toInches(n, unit)) : null
  const fill = ((Math.min(max, Math.max(min, current)) - min) / (max - min)) * 100

  // Holding − or + keeps counting, like a real stepper.
  const latest = useRef(value)
  latest.current = value
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const nudge = (dir: 1 | -1) => {
    const v = Number(latest.current.replace(',', '.'))
    const base =
      latest.current !== '' && Number.isFinite(v) ? v : fromInches(SPAN.start, unit) - dir * step
    onChange(fmt(Math.min(max, Math.max(min, base + dir * step)), unit))
  }
  const hold = (dir: 1 | -1) => {
    nudge(dir)
    const repeat = (delay: number) => {
      timer.current = setTimeout(() => {
        nudge(dir)
        repeat(Math.max(45, delay * 0.8))
      }, delay)
    }
    repeat(380)
  }
  const release = () => clearTimeout(timer.current)
  useEffect(() => release, [])

  return (
    <div className={`sf-measure${has ? ' is-set' : ''}`}>
      <div className="sf-measure__head">
        <label htmlFor={`${id}-n`}>{label}</label>
        <span id={`${id}-hint`}>{hint}</span>
      </div>
      <div className="sf-measure__control">
        <button
          type="button"
          aria-label={`Less ${label.toLowerCase()}`}
          onPointerDown={(e) => {
            e.preventDefault()
            hold(-1)
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && nudge(-1)}
          disabled={has && n <= min}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M6 12h12" />
          </svg>
        </button>
        <div className="sf-measure__value">
          <input
            id={`${id}-n`}
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            aria-describedby={`${id}-hint`}
            placeholder="0"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                nudge(1)
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                nudge(-1)
              }
            }}
            style={{ width: `${Math.max(2, (value || '0').length) + 0.4}ch` }}
          />
          <span>{unit === 'in' ? 'inches' : 'cm'}</span>
        </div>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          onPointerDown={(e) => {
            e.preventDefault()
            hold(1)
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && nudge(1)}
          disabled={has && n >= max}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M6 12h12M12 6v12" />
          </svg>
        </button>
      </div>
      <input
        type="range"
        className="sf-measure__slider"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, current))}
        onChange={(e) => onChange(fmt(Number(e.target.value), unit))}
        aria-label={`${label} slider`}
        aria-valuetext={has ? `${value} ${unit === 'in' ? 'inches' : 'cm'}` : 'not set'}
        style={{ '--fill': `${fill}%` } as CSSProperties}
      />
      <div className="sf-measure__scale" aria-hidden>
        <span>{min}</span>
        <span>
          {max} {unit === 'in' ? 'in' : 'cm'}
        </span>
      </div>
      <p className={`sf-measure__band${b ? ` is-${b.tone}` : ''}`}>
        {b ? b.text : <>Type it, slide it, or use − and +</>}
      </p>
    </div>
  )
}

/** Calculator plus chart, sharing the highlighted row. Inches first, like the tape most people own. */
export function SizeFinder({
  compact,
  onSelect,
  shopLink = true,
}: {
  compact?: boolean
  onSelect?: (size: PantSize) => void
  shopLink?: boolean
}) {
  const [unit, setUnit] = useState<Unit>('in')
  const [match, setMatch] = useState<PantSize | null>(null)
  return (
    <div className={`finder${compact ? ' finder--compact' : ''}`}>
      <SizeCalculator
        unit={unit}
        onUnit={setUnit}
        onResult={setMatch}
        onSelect={onSelect}
        shopLink={shopLink}
      />
      <SizeTable highlight={match} compact={compact} />
    </div>
  )
}

export { PANT_SIZES }
