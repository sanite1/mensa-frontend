// Photo — placeholder / image block used in product cards and PDP.
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
  /** Loading hint, defaults to `lazy`. Pass `eager` for above the fold heroes so LCP is not deferred. */
  priority?: 'lazy' | 'eager'
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
  priority = 'lazy',
}: PhotoProps) {
  // Dark tones need light text; everything else uses graphite.
  const textColorClass =
    tone === 'ink' || tone === 'pink' ? 'text-paper' : 'text-graphite'

  // Runtime aspect ratio and object position surface as CSS custom properties for the classes.
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
          loading={priority}
          decoding="async"
          fetchPriority={priority === 'eager' ? 'high' : 'auto'}
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
