// CartDrawer: the design system's bag panel, driven by useCartStore and
// mounted once in the platform layout so it works on every route.
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '@/lib/network/stores/cart.store'
import { useFormatPrice } from '@/lib/currency'
import { useScrollLock } from '@/lib/useScrollLock'

const MAX_QTY = 20

export function CartDrawer() {
  const open = useCartStore((s) => s.isDrawerOpen)
  const close = useCartStore((s) => s.closeDrawer)
  const lines = useCartStore((s) => s.lines)
  const subtotal = useCartStore((s) => s.subtotal())
  const count = useCartStore((s) => s.totalItems())
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const formatPrice = useFormatPrice()
  const panel = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useScrollLock(open)

  // Moving to another page closes the bag.
  useEffect(() => close(), [pathname, close])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    panel.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <div className={`bag${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="bag__scrim" onClick={close} />
      <div
        className="bag__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        tabIndex={-1}
        ref={panel}
      >
        <div className="bag__head">
          <h2>
            Your bag <span>{count}</span>
          </h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close bag">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="bag__empty">
            <div className="bag__empty-icon">
              <svg>
                <use href="#i-bag" />
              </svg>
            </div>
            <h3>Your bag is empty</h3>
            <p>
              Most people start with a pack of 3 period pants: one on, one in the wash, one dry.
            </p>
            <Link className="btn" to="/shop" onClick={close}>
              Shop everything{' '}
              <svg className="arrow" width="18" height="18">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            <ul className="bag__lines">
              {lines.map((l) => (
                <li key={l.variantId} className="bag__line">
                  <Link to={`/shop/${l.slug}`} className="bag__img" onClick={close}>
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt="" className="absolute inset-0 size-full" />
                    ) : null}
                  </Link>
                  <div className="bag__info">
                    <Link to={`/shop/${l.slug}`} onClick={close}>
                      <b>{l.productName}</b>
                    </Link>
                    {l.variantLabel && l.variantLabel !== l.productName ? (
                      <span>{l.variantLabel}</span>
                    ) : null}
                    <div className="qty qty--sm">
                      <button
                        type="button"
                        onClick={() => updateQty(l.variantId, l.qty - 1)}
                        aria-label={`One less ${l.productName}`}
                      >
                        −
                      </button>
                      <span aria-live="polite">{l.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(l.variantId, l.qty + 1)}
                        aria-label={`One more ${l.productName}`}
                        disabled={l.qty >= MAX_QTY}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="bag__price">
                    <b>{formatPrice(l.unitPrice * l.qty)}</b>
                    <button type="button" onClick={() => removeItem(l.variantId)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag__foot">
              <div className="bag__row">
                <span>Subtotal</span>
                <b>{formatPrice(subtotal)}</b>
              </div>
              <p className="bag__note">
                Delivery and any discount code are worked out at checkout.
              </p>
              <Link className="btn bag__checkout" to="/checkout" onClick={close}>
                Checkout · {formatPrice(subtotal)}{' '}
                <svg className="arrow" width="18" height="18">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              <p className="bag__secure">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  width="14"
                  height="14"
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Secure payment with Paystack: card, transfer or USSD
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
