// AccountShell: shared frame for the account pages in the design system's
// look (blush band, eyebrow, rising heading). The pages own their copy.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AccountShellProps {
  eyebrow: ReactNode
  title: ReactNode
  lede?: ReactNode
  /** Optional back link shown above the eyebrow. */
  back?: { to: string; label: string }
  /** Rendered beside the heading (buttons, links). */
  aside?: ReactNode
  children: ReactNode
}

export function AccountShell({ eyebrow, title, lede, back, aside, children }: AccountShellProps) {
  return (
    <main className="section section--blush min-h-[70vh]">
      <div className="wrap max-w-240">
        {back ? (
          <Link
            to={back.to}
            className="mb-6 inline-block text-[11px] font-medium uppercase tracking-[0.12em] text-(--mute) hover:text-(--ink)"
          >
            {back.label}
          </Link>
        ) : null}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="split mt-4">
              <span className="split-line">
                <span>{title}</span>
              </span>
            </h1>
            {lede ? <p className="lede mt-4 max-w-130">{lede}</p> : null}
          </div>
          {aside}
        </header>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  )
}

/** White design card used across the account pages. */
export function AccountCard({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={`ptn-card ${className}`}>{children}</div>
}
