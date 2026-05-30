// ─────────────────────────────────────────────────────────────────────────
// UtilityStrip — top dark strip on desktop/tablet headers.
// Mobile uses a slimmer marquee-style version inside HeaderMobile.
//
// Left-hand promo (free delivery line) is gated behind the
// `features.freeDelivery` flag so it can be flipped on per environment
// without editing this file.
// ─────────────────────────────────────────────────────────────────────────
import { cn } from '@/lib/utils'
import { IconChevronDown, IconTruck } from './icons'
import {
  features,
  FREE_DELIVERY_THRESHOLD_LABEL,
} from '@/lib/features'

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
        {features.freeDelivery ? (
          <>
            <IconTruck size={15} />
            <span>
              Free delivery in Abuja &amp; Lagos over {FREE_DELIVERY_THRESHOLD_LABEL}
            </span>
          </>
        ) : (
          <span>Reusable period products. Made in Abuja.</span>
        )}
      </div>
      <div className="flex items-center gap-5.5 opacity-85">
        <a href="/track" className="text-inherit no-underline">
          Track order
        </a>
        <span className="opacity-40">·</span>
        <a href="/help" className="text-inherit no-underline">
          Help
        </a>
        <span className="opacity-40">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block rounded-px w-3.5 h-2.25 bg-ng-flag"
          />
          NGN
          <IconChevronDown size={12} />
        </span>
      </div>
    </div>
  )
}
