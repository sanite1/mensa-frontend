// ClickableRow — a table row that navigates as a whole, so the admin can
// click anywhere on it instead of hunting for the linked cell. Inner links
// and buttons still work: they stop the click before it reaches the row.
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function ClickableRow({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <tr
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(to)
      }}
      tabIndex={0}
      className={cn(
        'cursor-pointer focus-visible:outline-none focus-visible:bg-cream-soft',
        className,
      )}
    >
      {children}
    </tr>
  )
}
