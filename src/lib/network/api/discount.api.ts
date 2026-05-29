import { api } from '../api'

export interface ApplyDiscountResult {
  discountAmount: number // kobo
  description: string
  code: string
}

export const discountApi = {
  apply: (code: string, cartSubtotal: number) =>
    api.post<ApplyDiscountResult>('/checkout/apply-discount', { code, cartSubtotal }),
}
