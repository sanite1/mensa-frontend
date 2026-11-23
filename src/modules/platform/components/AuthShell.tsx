// AuthShell: shared card for the four auth pages, in the design system's
// look (blush band, white card, rising heading). The pages own their copy.
import type { ReactNode } from 'react'

interface AuthShellProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  /** Rendered below the card. */
  footer?: ReactNode
  children: ReactNode
}

export function AuthShell({ eyebrow, title, subtitle, footer, children }: AuthShellProps) {
  return (
    <main className="section section--blush min-h-[70vh]">
      <div className="wrap grid justify-items-center">
        <div className="w-full max-w-115">
          <div className="ptn-card">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="split mt-4 text-(length:--fs-h3)">
              <span className="split-line">
                <span>{title}</span>
              </span>
            </h1>
            {subtitle ? <p className="mt-3 text-(--mute)">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
          </div>
          {footer ? (
            <div className="mt-5 text-center text-(length:--fs-sm) text-(--mute) [&_a]:font-medium [&_a]:text-(--berry) [&_button]:font-medium [&_button]:text-(--berry)">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
