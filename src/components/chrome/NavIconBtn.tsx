// NavIconBtn — 40×40 icon-only header button with optional badge.
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NavIconBtnProps {
  children: ReactNode
  label: string
  badge?: number | null
  href?: string
  onClick?: () => void
  className?: string
}

export function NavIconBtn({ children, label, badge, href, onClick, className }: NavIconBtnProps) {
  const base = cn(
    'relative inline-flex h-10 w-10 items-center justify-center rounded-sm bg-transparent text-ink hover:bg-cream transition-colors',
    className,
  )

  const content = (
    <>
      {children}
      {badge != null && badge > 0 ? (
        <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center rounded-full bg-coral text-white font-sans font-semibold min-w-4 h-4 px-1 text-[10px] leading-none">
          {badge}
        </span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <Link to={href} aria-label={label} title={label} className={base}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={base}>
      {content}
    </button>
  )
}
