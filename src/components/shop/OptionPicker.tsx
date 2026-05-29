// ─────────────────────────────────────────────────────────────────────────
// OptionPicker — renders one row of pill selectors per option type
// declared on the product (Size, Color, etc.). Lifts the selection state
// to the parent so the PDP can resolve it to a specific variant.
//
// Values that would yield an out of stock or inactive variant given the
// other currently selected options are rendered struck through and still
// clickable (so the user can pivot their selection).
// ─────────────────────────────────────────────────────────────────────────
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
                <span className="t-body-s text-[var(--ink)] font-semibold">{type}</span>
                {selectedOptions[type] ? (
                  <span className="t-body-s text-[var(--graphite)]">
                    {selectedOptions[type]}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {values.map((value) => {
                const isSelected = selectedOptions[type] === value
                // Combine this candidate with the rest of the current
                // selection. If no active in stock variant matches, mark
                // it visually as out of stock.
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
                      'relative font-sans font-medium transition-colors',
                    )}
                    style={{
                      minWidth: 56,
                      padding: '12px 16px',
                      background: isSelected ? 'var(--ink)' : 'var(--paper)',
                      color: isSelected
                        ? 'var(--paper)'
                        : isOutOfStock
                          ? 'var(--mute)'
                          : 'var(--ink)',
                      border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--hairline)'}`,
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                    aria-label={
                      isOutOfStock ? `${value} (out of stock)` : String(value)
                    }
                  >
                    {value}
                    {isOutOfStock && !isSelected ? (
                      <span
                        className="absolute pointer-events-none"
                        style={{
                          top: '50%',
                          left: 8,
                          right: 8,
                          borderTop: '1px solid var(--mute)',
                          transform: 'rotate(-12deg)',
                          opacity: 0.5,
                        }}
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
