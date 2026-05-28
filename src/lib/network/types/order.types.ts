export type OrderSource = 'web' | 'manual' | 'imported'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type FulfilmentStatus = 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type ShippingMethod = 'inhouse' | 'sendbox'

export interface Address {
  label: string
  recipient: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postcode?: string
  isDefault?: boolean
}

export interface OrderLine {
  productId: string
  variantId: string
  productName: string
  variantLabel: string
  unitPrice: number  // kobo
  qty: number
  subtotal: number   // kobo
}

export interface Order {
  _id: string
  orderNumber: string
  source: OrderSource
  userId?: string
  b2bOrgId?: string
  email: string
  phone: string
  shippingAddress: Address
  lines: OrderLine[]
  subtotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  grandTotal: number
  currency: 'NGN'
  appliedDiscountCodes: string[]
  shippingMethod: ShippingMethod
  shippingProvider?: string
  trackingNumber?: string
  paymentStatus: PaymentStatus
  fulfilmentStatus: FulfilmentStatus
  paystackReference?: string
  createdAt: string
  updatedAt: string
}

export interface ShippingOption {
  serviceId: string
  name: string
  provider: string
  fee: number       // kobo
  etaMin: number    // days
  etaMax: number
  method: ShippingMethod
}

export interface ShippingRatesPayload {
  address: Pick<Address, 'state' | 'city'>
  items: Array<{ variantId: string; qty: number }>
}

export interface CheckoutPayload {
  email: string
  phone: string
  shippingAddress: Omit<Address, 'label' | 'isDefault'>
  lines: Array<{ variantId: string; qty: number }>
  shippingServiceId: string
  discountCodes: string[]
  saveAddress?: boolean
}
