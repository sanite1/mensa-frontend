// ─────────────────────────────────────────────────────────────────────────
// UtilityStrip — top dark strip on desktop/tablet headers.
// Mobile uses a slimmer marquee-style version inside HeaderMobile.
//
// Left-hand promo (free delivery line) is gated behind the
// `features.freeDelivery` flag so it can be flipped on per environment
// without editing this file.
// ─────────────────────────────────────────────────────────────────────────
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
      className="flex items-center justify-between bg-[var(--ink)] text-[var(--paper)] font-sans"
      style={{
        padding: compact ? '8px 24px' : '10px 48px',
        fontSize: 12.5,
        letterSpacing: '0.04em',
      }}
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
      <div className="flex items-center gap-[22px] opacity-85">
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
            className="inline-block rounded-[1px]"
            style={{
              width: 14,
              height: 9,
              background: 'linear-gradient(to right,#008751 50%,#fff 50%)',
            }}
          />
          NGN
          <IconChevronDown size={12} />
        </span>
      </div>
    </div>
  )
}
