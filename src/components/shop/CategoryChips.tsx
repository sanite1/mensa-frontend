// ─────────────────────────────────────────────────────────────────────────
// CategoryChips — pill style category selector for the Shop page filter
// bar. `active=null` means "All".
// ─────────────────────────────────────────────────────────────────────────
import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/lib/network/types/product.types'

export interface CategoryOption {
  id: ProductCategory | null
  label: string
  count?: number
}

export const SHOP_CATEGORIES: CategoryOption[] = [
  { id: null, label: 'All' },
  { id: 'pants', label: 'Period pants' },
  { id: 'pads', label: 'Reusable pads' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'education', label: 'Education' },
]

interface CategoryChipsProps {
  active: ProductCategory | null
  onChange: (next: ProductCategory | null) => void
  counts?: Record<string, number>
  /** Visual density of the chips. */
  density?: 'sm' | 'md' | 'lg'
}

export function CategoryChips({
  active,
  onChange,
  counts,
  density = 'lg',
}: CategoryChipsProps) {
  const padding = density === 'sm' ? '7px 12px' : '9px 16px'
  const fontSize = density === 'sm' ? 12.5 : 13.5

  return (
    <div className="flex gap-1.5 flex-wrap">
      {SHOP_CATEGORIES.map((opt) => {
        const isActive = opt.id === active
        const count = opt.id === null
          ? Object.values(counts ?? {}).reduce((a, b) => a + b, 0)
          : counts?.[opt.id]
        return (
          <button
            key={opt.id ?? 'all'}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex items-baseline gap-1.5 rounded-full font-sans font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-[var(--ink)] text-[var(--paper)] border border-[var(--ink)]'
                : 'bg-transparent text-[var(--ink)] border border-[var(--hairline)] hover:border-[var(--ink)]',
            )}
            style={{ padding, fontSize, letterSpacing: '0.01em' }}
          >
            {opt.label}
            {count != null ? (
              <span
                className="font-mono"
                style={{ opacity: isActive ? 0.7 : 0.5, fontSize: 11 }}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
