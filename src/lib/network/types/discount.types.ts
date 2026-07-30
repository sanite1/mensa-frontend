// discount.types.ts — mirror of backend src/interfaces/discount.interface.ts.

import type { Pagination } from './common.types'

export type DiscountType = 'percent' | 'fixed'

export interface Discount {
  _id: string
  code: string
  type: DiscountType
  /** Percent: 1-100. Fixed: kobo. */
  value: number
  expiresAt: string | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  description: string
  createdAt: string
  updatedAt: string
}

// ── Apply (preview) ──────────────────────────────────────────────
export interface ApplyDiscountInput {
  code: string
  /** Cart subtotal in kobo (sum of line totals, before shipping). */
  subtotal: number
}

export interface ApplyDiscountResponseData {
  code: string
  type: DiscountType
  /** Kobo to subtract from the subtotal. */
  discountKobo: number
  /** Human readable e.g. "10% off" or "₦2,000 off". */
  description: string
}

// ── Admin CRUD ───────────────────────────────────────────────────
export interface CreateDiscountInput {
  code: string
  type: DiscountType
  value: number
  expiresAt?: string | null
  maxUses?: number | null
  isActive?: boolean
  description?: string
}

export type UpdateDiscountInput = Partial<CreateDiscountInput>

export interface ListDiscountsParams {
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface ListDiscountsResponseData {
  items: Discount[]
  pagination: Pagination
}

export interface DiscountResponseData {
  discount: Discount
}
