// ─────────────────────────────────────────────────────────────────────────
// Mensa brand mark — renders the official lockup PNG (Mensa wordmark +
// "PERIOD PRODUCTS" sub-mark) at the requested height.
//
// API mirrors the design primitive:
//   tone="pink"  default — for light surfaces, no filter
//   tone="paper" — inverts the lockup to white for dark surfaces (footer)
//   tone="ink"   — turns the lockup black for high-contrast contexts
//
// Height is a runtime number; we route it through a CSS variable so the
// Tailwind arbitrary-value class can consume it without surfacing as a
// regular inline style. The tone filter likewise becomes a Tailwind class
// per option so there's no inline style on the path here.
// ─────────────────────────────────────────────────────────────────────────
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import logoSrc from '@/assets/mensa_logo.png'

interface MensaMarkProps {
  height?: number
  tone?: 'pink' | 'paper' | 'ink'
  className?: string
}

// Arbitrary-value filter classes so Tailwind generates exactly the
// declaration we need (no `filter-` theme token covers these brand-
// specific filter recipes).
const TONE_FILTER_CLASS: Record<NonNullable<MensaMarkProps['tone']>, string> = {
  pink: '',
  paper: 'filter-[brightness(0)_invert(1)]',
  ink: 'filter-[brightness(0)]',
}

function buildVars(height: number): CSSProperties {
  return { '--mark-h': `${height}px` } as CSSProperties
}

export function MensaWordmark({ height = 28, tone = 'pink', className }: MensaMarkProps) {
  return (
    <img
      src={logoSrc}
      alt="Mensa"
      className={cn('inline-block w-auto h-(--mark-h)', TONE_FILTER_CLASS[tone], className)}
      style={buildVars(height)}
    />
  )
}

export function MensaLockup({ height = 64, tone = 'pink', className }: MensaMarkProps) {
  return (
    <img
      src={logoSrc}
      alt="Mensa Period Products"
      className={cn('inline-block w-auto h-(--mark-h)', TONE_FILTER_CLASS[tone], className)}
      style={buildVars(height)}
    />
  )
}
