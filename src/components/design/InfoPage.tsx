// InfoPage: the design system's shell for text pages (returns, privacy,
// terms). Split heading hero, prose column and a sticky side column.
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function InfoPage({
  eyebrow,
  title,
  accent,
  lede,
  updated,
  aside,
  children,
}: {
  eyebrow: string
  title: string
  accent?: string
  lede?: ReactNode
  updated?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="info">
      <header className="info-hero">
        <div className="wrap">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="split">
            <span className="split-line">
              <span>{title}</span>
            </span>
            {accent ? (
              <span className="split-line">
                <span className="accent" style={{ '--d': '.1s' } as CSSProperties}>
                  {accent}
                </span>
              </span>
            ) : null}
          </h1>
          {lede ? <p className="lede">{lede}</p> : null}
          {updated ? <p className="info-updated">{updated}</p> : null}
        </div>
      </header>
      <div className="wrap info-body">
        <article className="prose">{children}</article>
        {aside ? <aside className="info-aside">{aside}</aside> : null}
      </div>
    </main>
  )
}

/** The "Questions?" card beside every text page. */
export function HelpCard() {
  return (
    <div className="help-card">
      <h3>Questions?</h3>
      <p>We're a small team in Abuja and we answer every message ourselves.</p>
      <a className="btn btn--light" href="mailto:hi@mensaproducts.com">
        hi@mensaproducts.com
      </a>
      <Link to="/orders/track">Track an order →</Link>
    </div>
  )
}
