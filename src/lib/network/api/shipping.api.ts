import { api } from '../api'
import type { ShippingRatesPayload, ShippingOption } from '../types/order.types'

export const shippingApi = {
  getRates: (body: ShippingRatesPayload) =>
    api.post<ShippingOption[]>('/checkout/shipping-rates', body),
}
