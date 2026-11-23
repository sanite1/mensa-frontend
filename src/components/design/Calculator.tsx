import { useState, type CSSProperties } from 'react'

const fmt = new Intl.NumberFormat('en-NG')
const naira = (v: number) => '₦' + fmt.format(Math.round(v))
const fill = (v: number, min: number, max: number) =>
  ({ '--fill': `${((v - min) / (max - min)) * 100}%` }) as CSSProperties

/** Savings calculator: what disposable pads cost over two and five years. */
export function Calculator() {
  const [spend, setSpend] = useState(3000)
  const [pads, setPads] = useState(20)

  return (
    <div className="calc">
      <div className="calc__panel" data-reveal>
        <div className="field">
          <label htmlFor="spend">
            Monthly spend on pads <output>{naira(spend)}</output>
          </label>
          <input
            id="spend"
            type="range"
            min={1000}
            max={15000}
            step={250}
            value={spend}
            onChange={(e) => setSpend(+e.target.value)}
            style={fill(spend, 1000, 15000)}
          />
        </div>
        <div className="field">
          <label htmlFor="pads">
            Pads used per period <output>{pads}</output>
          </label>
          <input
            id="pads"
            type="range"
            min={6}
            max={40}
            step={1}
            value={pads}
            onChange={(e) => setPads(+e.target.value)}
            style={fill(pads, 6, 40)}
          />
        </div>
      </div>
      <div
        className="calc__panel calc__panel--result"
        data-reveal
        style={{ '--d': '.1s' } as CSSProperties}
      >
        <div>
          <span className="eyebrow">Over the next five years on disposables</span>
          <div className="calc__big" style={{ marginTop: '1rem' }}>
            {naira(spend * 60)}
          </div>
        </div>
        <div className="calc__row">
          <div>
            <b>{naira(spend * 24)}</b>
            <span>spent in just two years</span>
          </div>
          <div>
            <b>{fmt.format(pads * 12 * 5)}</b>
            <span>pads to landfill in five years</span>
          </div>
        </div>
        <p className="calc__note">
          One Mensa pant can replace over 250 disposable pads during its lifetime.
        </p>
      </div>
    </div>
  )
}
