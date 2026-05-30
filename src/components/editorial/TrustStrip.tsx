// ─────────────────────────────────────────────────────────────────────────
// TrustStrip — horizontal row of trust badges (icon optional + text).
// Used at the foot of the hero on the homepage and reused for the about
// hero band. The design uses it as a quiet, hairline-bordered footer
// inside larger sections rather than a banner.
//
// Text colour is caller-driven (defaults to muted graphite). Routed via
// a CSS variable so the strip stays inline-style-free in the layout.
// ─────────────────────────────────────────────────────────────────────────
import type { CSSProperties, ReactNode } from 'react'

interface TrustStripItem {
  icon?: ReactNode
  text: ReactNode
}

interface TrustStripProps {
  items: TrustStripItem[]
  /** Defaults to mute graphite. Pass a brighter colour for ink backgrounds. */
  color?: string
}

export function TrustStrip({ items, color = 'var(--graphite)' }: TrustStripProps) {
  const cssVar = { '--ts-color': color } as CSSProperties
  return (
    <div
      className="flex flex-wrap items-center gap-7 pt-5 border-t border-hairline"
      style={cssVar}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="inline-flex items-center gap-2 text-[13px] text-(--ts-color)"
        >
          {item.icon ? <span className="text-pink">{item.icon}</span> : null}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  )
}
