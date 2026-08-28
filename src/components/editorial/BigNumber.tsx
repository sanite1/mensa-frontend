// BigNumber — large italic editorial numeral. Colour and size thread through CSS custom properties so no inline style attribute is needed.
import type { CSSProperties, ReactNode } from 'react'

interface BigNumberProps {
  children: ReactNode
  color?: string
  /** Pixel size; design uses 56 in light sections, 88 on the dark impact block. */
  size?: number
}

export function BigNumber({ children, color = 'var(--coral)', size = 56 }: BigNumberProps) {
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
