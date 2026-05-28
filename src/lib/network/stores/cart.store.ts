import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLine {
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  unitPrice: number  // kobo
  qty: number
  imageUrl?: string
  slug: string
}

interface CartState {
  lines: CartLine[]
  addItem: (line: Omit<CartLine, 'qty'> & { qty?: number }) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

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

      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),

      totalItems: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
    }),
    { name: 'mensa-cart' },
  ),
)
