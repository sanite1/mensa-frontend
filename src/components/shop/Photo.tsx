// ─────────────────────────────────────────────────────────────────────────
// Photo — placeholder / image block used in product cards and PDP.
// Shows the supplied src when available; otherwise renders a tone backed
// placeholder with a tiny mono label so the layout still feels alive.
//
// Tailwind-only layout. The few values that have to come in at runtime
// (aspect ratio from a prop, object-position from a prop) are routed via
// CSS custom properties and consumed by arbitrary-value Tailwind classes
// so the className still owns the styling intent.
// ─────────────────────────────────────────────────────────────────────────
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'blush' | 'cream' | 'pink' | 'ink' | 'stripe' | 'paper'

interface PhotoProps {
  src?: string
  alt?: string
  tone?: Tone
  /** Aspect ratio expressed as `width/height`, e.g. `'4/5'`, `'1/1'`. */
  ratio?: string
  /** object-position style, e.g. 'center 30%'. */
  objectPos?: string
  /** Label shown on the placeholder when no src. */
  label?: ReactNode
  sublabel?: ReactNode
  className?: string
}

// Stripe needs a gradient that has no theme token equivalent, so it lives
// as an arbitrary-value bg-image class. The rest are normal theme tokens.
const TONE_CLASS: Record<Tone, string> = {
  blush: 'bg-blush',
  cream: 'bg-cream',
  pink: 'bg-pink',
  ink: 'bg-ink',
  paper: 'bg-paper',
  stripe:
    'bg-blush-stripe',
}

export function Photo({
  src,
  alt = '',
  tone = 'blush',
  ratio = '4/5',
  objectPos,
  label,
  sublabel,
  className,
}: PhotoProps) {
  // Dark tones need light text; everything else uses graphite.
  const textColorClass =
    tone === 'ink' || tone === 'pink' ? 'text-paper' : 'text-graphite'

  // Aspect ratio + object position must come in at render time. We
  // surface them as CSS custom properties so the className can reference
  // them via arbitrary-value classes.
  const cssVars: CSSProperties = {
    '--photo-ratio': ratio,
    '--photo-obj': objectPos ?? 'center',
  } as CSSProperties

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden aspect-(--photo-ratio)',
        TONE_CLASS[tone],
        className,
      )}
      style={cssVars}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover object-(--photo-obj)"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-end justify-end p-4">
          {label ? (
            <span
              className={cn(
                't-micro text-right opacity-85',
                textColorClass,
              )}
            >
              {label}
            </span>
          ) : null}
          {sublabel ? (
            <span
              className={cn(
                't-micro text-right opacity-60',
                textColorClass,
              )}
            >
              {sublabel}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
