// ─────────────────────────────────────────────────────────────────────────
// CartDrawer — slide in from the right when the header bag icon is
// clicked or after Add to bag. Controlled by useCartStore.isDrawerOpen.
//
// Built with plain Tailwind transforms (no Radix Dialog), so it has zero
// runtime plugin dependencies and behaves consistently in every browser.
// Mounted once at the platform layout level so it works on every route.
// ─────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCartStore, type CartLine } from '@/lib/network/stores/cart.store'
import { useFormatPrice } from '@/lib/currency'
import { Photo } from '@/components/shop/Photo'
import { IconArrowRight, IconClose } from '@/components/chrome/icons'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const lines = useCartStore((s) => s.lines)
  const subtotalKobo = useCartStore((s) => s.subtotal())
  const totalItems = useCartStore((s) => s.totalItems())

  // Lock body scroll while open.
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [isOpen])

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeDrawer])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:max-w-110',
          'bg-paper border-l border-hairline-soft',
          'flex flex-col',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-hairline-soft flex items-center justify-between">
          <div className="flex flex-col items-start gap-0.5">
            <h2 className="m-0 text-ink font-display italic font-semibold text-[28px] leading-[1.05] tracking-[-0.02em]">
              Your bag
            </h2>
            <p className="m-0 text-[11px] text-mute uppercase tracking-[0.12em] font-medium">
              {totalItems === 0 ? 'Empty' : `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-ink hover:bg-cream"
          >
            <IconClose />
          </button>
        </div>

        {/* Body */}
        {lines.length === 0 ? (
          <EmptyState onClose={closeDrawer} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ul className="m-0 p-0 list-none">
              {lines.map((line) => (
                <LineItem key={line.variantId} line={line} />
              ))}
            </ul>
          </div>
        )}

        {/* Footer / checkout */}
        {lines.length > 0 ? (
          <CartFooter subtotalKobo={subtotalKobo} onContinueShopping={closeDrawer} />
        ) : null}
      </aside>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
function LineItem({ line }: { line: CartLine }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const formatPrice = useFormatPrice()

  return (
    <li className="flex gap-4 px-6 py-5 border-b border-hairline-soft">
      <Link
        to={`/shop/${line.slug}`}
        onClick={closeDrawer}
        className="shrink-0 no-underline w-18"
        aria-label={`View ${line.productName}`}
      >
        <Photo src={line.imageUrl} alt={line.productName} tone="blush" ratio="4/5" />
      </Link>

      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/shop/${line.slug}`}
            onClick={closeDrawer}
            className="text-ink no-underline font-display italic font-semibold text-[18px] leading-[1.05] tracking-[-0.015em]"
          >
            {line.productName}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(line.variantId)}
            className="text-mute hover:text-ink shrink-0"
            aria-label={`Remove ${line.productName} from bag`}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="font-mono uppercase text-mute text-[10.5px] tracking-widest">
          {line.variantLabel}
        </div>

        <div className="flex items-center justify-between gap-3 mt-1.5">
          <div className="inline-flex items-center bg-paper border border-hairline rounded-sm">
            <button
              type="button"
              onClick={() => updateQty(line.variantId, line.qty - 1)}
              className="w-8 h-8 text-[15px] text-ink hover:bg-cream"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-center text-ink min-w-7 text-[13px]">{line.qty}</span>
            <button
              type="button"
              onClick={() => updateQty(line.variantId, line.qty + 1)}
              className="w-8 h-8 text-[15px] text-ink hover:bg-cream"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="font-sans text-ink font-semibold text-[15px]">
            {formatPrice(line.unitPrice * line.qty)}
          </div>
        </div>
      </div>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────
function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="t-eyebrow text-mute mb-3">Your bag is empty</div>
      <h3 className="m-0 font-display italic font-semibold text-[28px] leading-[1.05] text-ink">
        Nothing here yet.
      </h3>
      <p className="t-body-s mt-3 text-graphite max-w-75">
        Once you add something to your bag, it will show up here.
      </p>
      <Button asChild variant="primary" size="lg" className="mt-6">
        <Link to="/shop" onClick={onClose}>
          Shop the collection <IconArrowRight size={16} />
        </Link>
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
function CartFooter({
  subtotalKobo,
  onContinueShopping,
}: {
  subtotalKobo: number
  onContinueShopping: () => void
}) {
  const formatPrice = useFormatPrice()
  return (
    <div className="border-t border-hairline-soft px-6 py-5 bg-paper">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[11px] text-mute uppercase tracking-[0.12em] font-medium">
          Subtotal
        </span>
        <span className="font-sans text-ink font-semibold text-[22px]">
          {formatPrice(subtotalKobo)}
        </span>
      </div>
      <div className="t-body-s text-mute mb-4">Shipping and discounts calculated at checkout.</div>

      <Button asChild variant="primary" size="lg" className="w-full">
        <Link to="/checkout" onClick={onContinueShopping}>
          Checkout <IconArrowRight size={16} />
        </Link>
      </Button>
      <button
        type="button"
        onClick={onContinueShopping}
        className="w-full mt-3 text-[14px] text-ink underline underline-offset-2"
      >
        Continue shopping
      </button>
    </div>
  )
}
