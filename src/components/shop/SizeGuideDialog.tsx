// SizeGuideDialog — period pants size chart modal for the PDP, waist measurements in inches.

import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SizeRow {
  size: string
  min: string
  max: string
}

/** Waist measurements in inches, straight from the brand size card. */
const ROWS: SizeRow[] = [
  { size: 'S', min: '26"', max: '32"' },
  { size: 'M', min: '30"', max: '36"' },
  { size: 'L', min: '35"', max: '41"' },
  { size: 'XL', min: '37"', max: '44"' },
]

export function SizeGuideDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {/* Header on a blush surface so the chart panel below reads as
            the same composition as the IG card the data comes from. */}
        <div className="bg-blush px-6 pt-8 pb-6 text-center">
          <div className="t-eyebrow text-berry">Period pants</div>
          <DialogTitle className="mt-2 font-display italic font-semibold text-[clamp(24px,4vw,32px)] leading-tight tracking-tight text-coral">
            Size chart
          </DialogTitle>
          <p className="mt-2 t-body-s text-berry max-w-110 mx-auto">
            Waist measurements in inches. Wrap a soft tape around the narrowest part of your
            waist and match the range below.
          </p>
        </div>

        {/* Table */}
        <div className="px-6 py-6">
          <div className="border border-blush-2">
            <div className="grid grid-cols-3 bg-blush text-berry text-[11px] uppercase tracking-widest font-medium font-mono">
              <div className="px-4 py-3 text-center">Size</div>
              <div className="px-4 py-3 text-center border-l border-blush-2">Min</div>
              <div className="px-4 py-3 text-center border-l border-blush-2">Max</div>
            </div>
            {ROWS.map((row: SizeRow, i: number) => (
              <div
                key={row.size}
                className={
                  'grid grid-cols-3 text-[15px] ' +
                  (i % 2 === 0 ? 'bg-paper' : 'bg-blush/40')
                }
              >
                <div className="px-4 py-3.5 text-center font-medium text-ink border-t border-blush-2">
                  {row.size}
                </div>
                <div className="px-4 py-3.5 text-center text-coral border-t border-l border-blush-2 font-mono">
                  {row.min}
                </div>
                <div className="px-4 py-3.5 text-center text-coral border-t border-l border-blush-2 font-mono">
                  {row.max}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-[12.5px] text-mute leading-relaxed">
            On the boundary between two sizes? Size up. The pant should feel like a hug, not a
            squeeze, so the absorbent layer stays close to your skin.
          </p>
          <p className="mt-3 text-[12.5px] text-mute leading-relaxed">
            Still unsure? Email <span className="text-ink">hi@mensaproducts.com</span> with your
            waist measurement and we will recommend a size.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
