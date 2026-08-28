// SectionEyebrow — uppercase label with hairline preceding section headings. Caller colour threads through a CSS custom property, not an inline style.
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionEyebrowProps {
  children: ReactNode
  /** CSS colour for the label + leading line. Defaults to muted ink. */
  color?: string
  className?: string
}

export function SectionEyebrow({
  children,
  color = 'var(--mute)',
  className,
}: SectionEyebrowProps) {
  // CSS custom property carries the caller's colour into the class
  // stack; the layout classes stay declarative.
  const cssVar = { '--eyebrow': color } as CSSProperties
  return (
    <div
      className={cn('inline-flex items-center gap-3 text-(--eyebrow)', className)}
      style={cssVar}
    >
      <span aria-hidden="true" className="w-7 h-px bg-current opacity-60" />
      <span className="font-mono text-[11px] tracking-[0.14em] uppercase font-medium">
        {children}
      </span>
    </div>
  )
}
