import { post } from '../api'
import type { ShippingRatesPayload, ShippingOption } from '../types/order.types'

export const shippingApi = {
  getRates: (body: ShippingRatesPayload) => post<ShippingOption[]>('/checkout/shipping-rates', body),
}
