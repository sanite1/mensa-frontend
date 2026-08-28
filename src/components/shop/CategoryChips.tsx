// CategoryChips — pill style category selector for the Shop page filter.
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
  { id: 'advocacy', label: 'Fashion items · Period advocacy' },
]

interface CategoryChipsProps {
  active: ProductCategory | null
  onChange: (next: ProductCategory | null) => void
  counts?: Record<string, number>
  /** Visual density of the chips. */
  density?: 'sm' | 'md' | 'lg'
}

export function CategoryChips({ active, onChange, counts, density = 'lg' }: CategoryChipsProps) {
  const densityClass =
    density === 'sm' ? 'py-1.75 px-3 text-[12.5px]' : 'py-2.25 px-4 text-[13.5px]'

  return (
    <div className="flex gap-1.5 flex-wrap">
      {SHOP_CATEGORIES.map((opt) => {
        const isActive = opt.id === active
        const count =
          opt.id === null
            ? Object.values(counts ?? {}).reduce((a, b) => a + b, 0)
            : counts?.[opt.id]
        return (
          <button
            key={opt.id ?? 'all'}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              'inline-flex items-baseline gap-1.5 rounded-full font-sans font-medium whitespace-nowrap transition-colors tracking-[0.01em]',
              densityClass,
              isActive
                ? 'bg-ink text-paper border border-ink'
                : 'bg-transparent text-ink border border-hairline hover:border-ink',
            )}
          >
            {opt.label}
            {count != null ? (
              <span className={cn('font-mono text-[11px]', isActive ? 'opacity-70' : 'opacity-50')}>
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
