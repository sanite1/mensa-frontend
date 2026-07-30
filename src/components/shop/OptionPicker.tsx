// OptionPicker — renders one row of pill selectors per option type.
import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/lib/network/types/product.types'

interface OptionPickerProps {
  optionTypes: string[]
  variants: ProductVariant[]
  selectedOptions: Record<string, string>
  onChange: (next: Record<string, string>) => void
}

export function OptionPicker({
  optionTypes,
  variants,
  selectedOptions,
  onChange,
}: OptionPickerProps) {
  if (optionTypes.length === 0) return null

  return (
    <div className="flex flex-col gap-5">
      {optionTypes.map((type) => {
        // Collect unique values for this option type in order of first
        // appearance across the variant list.
        const seen = new Set<string>()
        const values: string[] = []
        for (const v of variants) {
          const value = v.options?.[type]
          if (value && !seen.has(value)) {
            seen.add(value)
            values.push(value)
          }
        }

        return (
          <div key={type}>
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-baseline gap-2.5">
                <span className="t-body-s text-ink font-semibold">{type}</span>
                {selectedOptions[type] ? (
                  <span className="t-body-s text-graphite">
                    {selectedOptions[type]}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {values.map((value) => {
                const isSelected = selectedOptions[type] === value
                // Mark the value out of stock when no active variant matches it plus the current selection.
                const candidate = { ...selectedOptions, [type]: value }
                const matching = variants.find(
                  (v) =>
                    v.isActive &&
                    v.stockCount > 0 &&
                    optionTypes.every(
                      (t) => (v.options?.[t] ?? '') === (candidate[t] ?? ''),
                    ),
                )
                const isOutOfStock = !matching

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange({ ...selectedOptions, [type]: value })}
                    className={cn(
                      'relative font-sans font-medium transition-colors min-w-14 py-3 px-4 rounded-sm text-[14px] border',
                      isSelected
                        ? 'bg-ink text-paper border-ink'
                        : isOutOfStock
                          ? 'bg-paper text-mute border-hairline'
                          : 'bg-paper text-ink border-hairline',
                    )}
                    aria-label={
                      isOutOfStock ? `${value} (out of stock)` : String(value)
                    }
                  >
                    {value}
                    {isOutOfStock && !isSelected ? (
                      <span
                        aria-hidden
                        className="absolute pointer-events-none top-1/2 left-2 right-2 border-t border-mute -rotate-12 opacity-50"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
