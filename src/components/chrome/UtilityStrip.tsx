// UtilityStrip — top dark strip on desktop/tablet headers.
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { IconTruck } from './icons'
import { CurrencyPicker } from './CurrencyPicker'

interface UtilityStripProps {
  compact?: boolean
}

export function UtilityStrip({ compact = false }: UtilityStripProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between bg-ink text-paper font-sans text-[12.5px] tracking-[0.04em]',
        compact ? 'py-2 px-6' : 'py-2.5 px-12',
      )}
    >
      <div className="flex items-center gap-2.5 opacity-[0.92]">
        <span>Reusable period products. Made in Abuja.</span>
      </div>
      <div className="flex items-center gap-5.5 opacity-85">
        <Link
          to="/orders/track"
          className="text-inherit no-underline inline-flex items-center gap-1.5 hover:opacity-100"
        >
          <IconTruck size={13} />
          Track order
        </Link>
        <span className="opacity-40">·</span>
        <Link to="/contact" className="text-inherit no-underline hover:opacity-100">
          Help
        </Link>
        <span className="opacity-40">·</span>
        {/* Currency picker converts display prices only, checkout still charges NGN. */}
        <CurrencyPicker tone="dark" />
      </div>
    </div>
  )
}
