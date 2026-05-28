import { get, getPaginated } from '../api'
import type { Product, ProductListParams } from '../types/product.types'

export const productApi = {
  list:      (params?: ProductListParams) => getPaginated<Product>('/products', { params }),
  getBySlug: (slug: string) => get<Product>(`/products/${slug}`),
}
