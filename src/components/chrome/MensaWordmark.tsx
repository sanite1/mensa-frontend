// MensaWordmark — official lockup PNG at a requested height with pink, paper, and ink tone filters.
// Height threads through a CSS variable so Tailwind classes consume it without inline styles.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import logoSrc from '@/assets/mensa_logo.png'

interface MensaMarkProps {
  height?: number
  tone?: 'pink' | 'paper' | 'ink'
  className?: string
}

// Arbitrary value filter classes, no `filter-` theme token covers these brand recipes.
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
