import { api } from '../api'
import type { Paginated } from '../api'
import type {
  Order,
  CheckoutPayload,
  ShippingRatesPayload,
  ShippingOption,
} from '../types/order.types'

export const orderApi = {
  list: () => api.get<Paginated<Order>>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  trackByNumber: (orderNumber: string, email: string) =>
    api.get<Order>(`/orders/track/${orderNumber}`, { params: { email } }),
  getShippingRates: (body: ShippingRatesPayload) =>
    api.post<ShippingOption[]>('/checkout/shipping-rates', body),
  applyDiscount: (code: string, cartSubtotal: number) =>
    api.post<{ discountAmount: number; description: string }>('/checkout/apply-discount', {
      code,
      cartSubtotal,
    }),
  initialize: (body: CheckoutPayload) =>
    api.post<{
      accessCode: string
      authorizationUrl: string
      orderId: string
      orderNumber: string
    }>('/checkout/initialize', body),
}
