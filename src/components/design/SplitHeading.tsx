// SplitHeading: the design's line by line rising heading. Each line slides up
// 0.1s after the one before it.
import type { CSSProperties, ReactNode } from 'react'

export function SplitHeading({
  lines,
  as: Tag = 'h2',
  className,
}: {
  lines: ReactNode[]
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <Tag className={`split${className ? ` ${className}` : ''}`}>
      {lines.map((line, i) => (
        <span key={i} className="split-line">
          <span style={i ? ({ '--d': `${i * 0.1}s` } as CSSProperties) : undefined}>{line}</span>
        </span>
      ))}
    </Tag>
  )
}
