// ═══════════════════════════════════════════════════════════════
// CurrencyPicker — dropdown in the utility strip.
//
// Display-only: switching here changes prices across the site but
// Paystack still charges in NGN at checkout. The CheckoutPage
// surfaces a small note when the selected currency != NGN so the
// customer is not surprised.
// ═══════════════════════════════════════════════════════════════

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconChevronDown } from './icons'
import { CURRENCIES, type CurrencyCode } from '@/lib/currency'
import { useCurrencyStore } from '@/lib/network/stores/currency.store'
import { cn } from '@/lib/utils'

interface CurrencyPickerProps {
  /** Tone of the trigger. Inverts colours for the dark utility strip vs
   *  the light mobile drawer surface. */
  tone?: 'dark' | 'light'
}

const ORDER: CurrencyCode[] = ['NGN', 'USD', 'GBP', 'EUR']

export function CurrencyPicker({ tone = 'dark' }: CurrencyPickerProps) {
  const currency = useCurrencyStore((s) => s.currency)
  const setCurrency = useCurrencyStore((s) => s.setCurrency)
  const current = CURRENCIES[currency]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center gap-1.5 outline-none cursor-pointer',
          tone === 'dark'
            ? 'text-paper hover:opacity-100'
            : 'text-ink hover:text-pink-deep',
        )}
        title={`Display currency: ${current.name}`}
      >
        <span aria-hidden className="text-[14px] leading-none">
          {current.flag}
        </span>
        <span>{current.code}</span>
        <IconChevronDown size={12} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-paper border border-hairline rounded-none min-w-44 py-1"
      >
        {ORDER.map((code) => {
          const meta = CURRENCIES[code]
          const active = code === currency
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setCurrency(code)}
              className={cn(
                'flex items-center gap-3 cursor-pointer text-[14px] text-ink py-2 px-3',
                active ? 'bg-cream-soft' : '',
              )}
            >
              <span aria-hidden className="text-[16px] leading-none">
                {meta.flag}
              </span>
              <span className="font-mono font-medium">{meta.code}</span>
              <span className="text-mute text-[12px]">{meta.name}</span>
            </DropdownMenuItem>
          )
        })}
        <div className="px-3 pt-2 pb-1 border-t border-hairline-soft mt-1 text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
          Charged in NGN
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
