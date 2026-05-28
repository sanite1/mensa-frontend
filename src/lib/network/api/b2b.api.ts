import { get, post, getPaginated } from '../api'
import type { B2BOrg, QuoteRequest } from '../types/b2b.types'

export const b2bApi = {
  register:     (body: unknown) => post<{ orgId: string }>('/b2b/register', body),
  getMe:        () => get<B2BOrg>('/b2b/me'),
  listQuotes:   () => getPaginated<QuoteRequest>('/b2b/quotes'),
  getQuote:     (id: string) => get<QuoteRequest>(`/b2b/quotes/${id}`),
  submitQuote:  (body: unknown) => post<QuoteRequest>('/b2b/quotes', body),
  acceptQuote:  (id: string) => post<{ orderId: string }>(`/b2b/quotes/${id}/accept`),
}
