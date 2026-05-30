// ─────────────────────────────────────────────────────────────────────────
// BigNumber — large italic editorial numeral used in the pillars / mission
// / manufacturing sections. Mirrors the design's BigNumber helper.
//
// Colour and pixel size are caller-driven, so we thread them through CSS
// custom properties consumed by Tailwind arbitrary-value classes. That
// keeps the layout intent on the className without dropping back to a
// generic style attribute.
// ─────────────────────────────────────────────────────────────────────────
import type { CSSProperties, ReactNode } from 'react'

interface BigNumberProps {
  children: ReactNode
  color?: string
  /** Pixel size; design uses 56 in light sections, 88 on the dark impact block. */
  size?: number
}

export function BigNumber({
  children,
  color = 'var(--coral)',
  size = 56,
}: BigNumberProps) {
  const cssVars = {
    '--bn-color': color,
    '--bn-size': `${size}px`,
  } as CSSProperties
  return (
    <span
      className="block font-display italic font-semibold leading-none tracking-[-0.02em] text-(--bn-color) text-(length:--bn-size)"
      style={cssVars}
    >
      {children}
    </span>
  )
}
