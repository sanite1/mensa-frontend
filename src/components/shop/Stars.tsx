// Stars — tiny star rating row, mirrors the design Stars helper.
interface StarsProps {
  value: number
  size?: number
  color?: string
  mutedColor?: string
}

export function Stars({
  value,
  size = 11,
  color = 'var(--ink)',
  mutedColor = 'var(--hairline)',
}: StarsProps) {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(value) ? color : mutedColor}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}
