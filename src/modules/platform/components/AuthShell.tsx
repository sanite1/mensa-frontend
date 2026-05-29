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
    <section className="bg-[var(--cream-soft)] flex items-start justify-center px-4 py-16 md:py-24 min-h-[70vh]">
      <div className="w-full max-w-[460px]">
        <div className="bg-[var(--paper)] border border-[var(--hairline-soft)] p-8 md:p-10">
          <div className="t-eyebrow text-[var(--mute)] mb-3">{eyebrow}</div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="t-body mt-3 text-[var(--graphite)]">{subtitle}</p>
          ) : null}

          <div className="mt-8">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-[14px] text-[var(--graphite)]">{footer}</div>
        ) : null}
      </div>
    </section>
  )
}
