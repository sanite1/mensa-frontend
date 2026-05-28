import { get, post, getPaginated } from '../api'
import type { Order, CheckoutPayload, ShippingRatesPayload, ShippingOption } from '../types/order.types'

export const orderApi = {
  list:              () => getPaginated<Order>('/orders'),
  getById:           (id: string) => get<Order>(`/orders/${id}`),
  trackByNumber:     (orderNumber: string, email: string) => get<Order>(`/orders/track/${orderNumber}`, { params: { email } }),
  getShippingRates:  (body: ShippingRatesPayload) => post<ShippingOption[]>('/checkout/shipping-rates', body),
  applyDiscount:     (code: string, cartSubtotal: number) => post<{ discountAmount: number; description: string }>('/checkout/apply-discount', { code, cartSubtotal }),
  initialize:        (body: CheckoutPayload) => post<{ accessCode: string; authorizationUrl: string; orderId: string; orderNumber: string }>('/checkout/initialize', body),
}
