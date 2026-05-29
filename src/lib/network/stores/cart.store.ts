import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLine {
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  unitPrice: number // kobo
  qty: number
  imageUrl?: string
  slug: string
}

interface CartState {
  lines: CartLine[]
  /** Whether the cart drawer is open. Not persisted to localStorage. */
  isDrawerOpen: boolean

  addItem: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void

  openDrawer: () => void
  closeDrawer: () => void
  setDrawerOpen: (open: boolean) => void

  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isDrawerOpen: false,

      addItem: (incoming) => {
        const qty = incoming.qty ?? 1
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === incoming.variantId)
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.variantId === incoming.variantId ? { ...l, qty: l.qty + qty } : l,
              ),
            }
          }
          return { lines: [...state.lines, { ...incoming, qty }] }
        })
      },

      removeItem: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),

      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l)),
        }))
      },

      clearCart: () => set({ lines: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
    }),
    {
      name: 'mensa-cart',
      // Only persist the lines. Drawer open state should never survive a
      // reload — nothing more jarring than reopening the page with the cart
      // drawer wide open.
      partialize: (state) => ({ lines: state.lines }),
      // Explicit merge so methods from the current store are preserved on
      // rehydration even if old localStorage data has a different shape.
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<CartState>),
      }),
    },
  ),
)
