// order.types.ts — mirror of backend IOrder + checkout DTOs. All monetary values are integer kobo, never floats.

import type { Pagination } from './common.types'

// ── Status enums ─────────────────────────────────────────────────
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partial_refund'

export type FulfilmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type ShippingMethod = 'inhouse' | 'sendbox'
export type OrderSource = 'web' | 'manual' | 'imported'

// ── Order document shape ─────────────────────────────────────────
export interface OrderLine {
  _id?: string
  productId: string
  variantId: string
  sku: string
  productName: string
  variantLabel: string
  imageUrl?: string
  slug: string
  /** Unit price in kobo at order time. */
  unitPrice: number
  qty: number
  /** unitPrice * qty, in kobo. */
  lineTotal: number
}

export interface OrderAddress {
  _id?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  country: string
  postal?: string
}

export interface OrderTotals {
  /** Sum of line totals in kobo. */
  subtotal: number
  /** Selected shipping rate in kobo. */
  shipping: number
  /** Discount applied in kobo. */
  discount: number
  /** subtotal + shipping − discount. */
  total: number
}

export interface OrderPayment {
  status: PaymentStatus
  reference: string
  accessCode?: string
  authorizationUrl?: string
  paidAt?: string
}

export interface OrderFulfilment {
  status: FulfilmentStatus
  shippingMethod: ShippingMethod
  trackingCode?: string
  trackingUrl?: string
  shippedAt?: string
  deliveredAt?: string
}

export interface Order {
  _id: string
  orderNumber: string
  source: OrderSource
  userId: string | null
  customerEmail: string
  customerPhone: string
  lines: OrderLine[]
  address: OrderAddress
  totals: OrderTotals
  payment: OrderPayment
  fulfilment: OrderFulfilment
  discountCode?: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
}

// ── Checkout DTOs ────────────────────────────────────────────────
export interface CheckoutLineInput {
  productId: string
  variantId: string
  qty: number
}

export interface CheckoutAddressInput {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  country: string
  postal?: string
}

export interface ShippingRatesInput {
  lines: CheckoutLineInput[]
  destination: {
    city: string
    state: string
    country: string
    postal?: string
  }
}

export interface ShippingRateOption {
  method: ShippingMethod
  name: string
  /** Plain English lead time, e.g. "1 to 2 days". */
  eta: string
  /** Cost in kobo. */
  amount: number
}

export interface ShippingRatesResponseData {
  options: ShippingRateOption[]
}

export interface InitializeCheckoutInput {
  lines: CheckoutLineInput[]
  address: CheckoutAddressInput
  customerEmail: string
  customerPhone: string
  shippingMethod: ShippingMethod
  /** Must match an option amount returned by /checkout/shipping-rates. */
  shippingAmount: number
  discountCode?: string
  /** Partner referral code captured from `?ref=` in the URL via
   *  lib/referral.ts. Forwarded so the backend can attribute the
   *  resulting order to the right partner. */
  referralCode?: string
}

export interface InitializeCheckoutResponseData {
  orderNumber: string
  reference: string
  accessCode: string
  authorizationUrl: string
  /** Charge amount in kobo. */
  amount: number
  /** Paystack public key, surfaced so the client doesn't need its own env var. */
  publicKey: string
}

// ── List endpoint response ───────────────────────────────────────
export interface ListOrdersParams {
  paymentStatus?: PaymentStatus
  fulfilmentStatus?: FulfilmentStatus
  page?: number
  pageSize?: number
}

export interface ListOrdersResponseData {
  items: Order[]
  pagination: Pagination
}

export interface OrderResponseData {
  order: Order
}

// ── Admin fulfilment update ──────────────────────────────────────
export interface UpdateOrderFulfilmentInput {
  status: FulfilmentStatus
  trackingCode?: string
  trackingUrl?: string
  /** Admin-only note appended to internalNotes with timestamp + author. */
  note?: string
}
