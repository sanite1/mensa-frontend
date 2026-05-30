// ─────────────────────────────────────────────────────────────────────────
// TrustLine — single row of the PDP trust block: coral icon + body copy.
// ─────────────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react'

interface TrustLineProps {
  icon: ReactNode
  children: ReactNode
}

export function TrustLine({ icon, children }: TrustLineProps) {
  return (
    <div className="flex items-center gap-3 text-[13.5px] text-(--graphite)">
      <span className="text-(--coral)">{icon}</span>
      {children}
    </div>
  )
}
