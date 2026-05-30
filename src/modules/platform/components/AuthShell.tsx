// ─────────────────────────────────────────────────────────────────────────
// AuthShell — shared wrapper for the four auth pages (Login, Register,
// Forgot, Reset). Provides the editorial structure: eyebrow + italic
// headline + subtitle, all sitting on a cream-soft section behind a
// paper card with hairline border.
// ─────────────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react'

interface AuthShellProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  /** Rendered below the form, separated by a hairline. */
  footer?: ReactNode
  children: ReactNode
}

export function AuthShell({ eyebrow, title, subtitle, footer, children }: AuthShellProps) {
  return (
    <section className="bg-(--cream-soft) flex items-start justify-center px-4 py-16 md:py-24 min-h-[70vh]">
      <div className="w-full max-w-115">
        <div className="bg-(--paper) border border-(--hairline-soft) p-8 md:p-10">
          <div className="t-eyebrow text-(--mute) mb-3">{eyebrow}</div>
          <h1 className="font-display italic font-semibold text-[44px] leading-[1.05] tracking-[-0.02em] text-ink">
            {title}
          </h1>
          {subtitle ? <p className="t-body mt-3 text-(--graphite)">{subtitle}</p> : null}

          <div className="mt-8">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-[14px] text-(--graphite)">{footer}</div>
        ) : null}
      </div>
    </section>
  )
}
