// ─────────────────────────────────────────────────────────────────────────
// Mensa brand mark — renders the official lockup PNG (Mensa wordmark +
// "PERIOD PRODUCTS" sub-mark) at the requested height.
//
// API mirrors the design primitive:
//   tone="pink"  default — for light surfaces, no filter
//   tone="paper" — inverts the lockup to white for dark surfaces (footer)
//   tone="ink"   — turns the lockup black for high-contrast contexts
//
// `MensaWordmark` and `MensaLockup` both render the same asset. They exist
// as separate components so call sites read true to intent and so that we
// can later split into two assets if the brand ever ships a wordmark-only
// SVG (without the "PERIOD PRODUCTS" sub-mark).
// ─────────────────────────────────────────────────────────────────────────
import logoSrc from '@/assets/mensa_logo.png'

interface MensaMarkProps {
  height?: number
  tone?: 'pink' | 'paper' | 'ink'
  className?: string
}

const TONE_FILTER: Record<NonNullable<MensaMarkProps['tone']>, string | undefined> = {
  pink: undefined,
  paper: 'brightness(0) invert(1)',
  ink: 'brightness(0)',
}

export function MensaWordmark({ height = 28, tone = 'pink', className }: MensaMarkProps) {
  return (
    <img
      src={logoSrc}
      alt="Mensa"
      className={className}
      style={{
        height,
        width: 'auto',
        display: 'inline-block',
        filter: TONE_FILTER[tone],
      }}
    />
  )
}

export function MensaLockup({ height = 64, tone = 'pink', className }: MensaMarkProps) {
  return (
    <img
      src={logoSrc}
      alt="Mensa Period Products"
      className={className}
      style={{
        height,
        width: 'auto',
        display: 'inline-block',
        filter: TONE_FILTER[tone],
      }}
    />
  )
}
