// ─────────────────────────────────────────────────────────────────────────
// Photo — placeholder / image block used in product cards and PDP.
// Shows the supplied src when available; otherwise renders a tone backed
// placeholder with a tiny mono label so the layout still feels alive.
// ─────────────────────────────────────────────────────────────────────────
import type { ReactNode } from 'react'
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

const TONE_BG: Record<Tone, string> = {
  blush: 'var(--blush)',
  cream: 'var(--cream)',
  pink: 'var(--pink)',
  ink: 'var(--ink)',
  paper: 'var(--paper)',
  stripe: 'repeating-linear-gradient(45deg, var(--blush-2) 0 8px, var(--blush) 8px 16px)',
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
  const textColor = tone === 'ink' || tone === 'pink' ? 'var(--paper)' : 'var(--graphite)'
  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{
        aspectRatio: ratio,
        background: TONE_BG[tone],
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: objectPos }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-end justify-end p-4">
          {label ? (
            <span
              className="t-micro"
              style={{ color: textColor, opacity: 0.85, textAlign: 'right' }}
            >
              {label}
            </span>
          ) : null}
          {sublabel ? (
            <span
              className="t-micro"
              style={{ color: textColor, opacity: 0.6, textAlign: 'right' }}
            >
              {sublabel}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
