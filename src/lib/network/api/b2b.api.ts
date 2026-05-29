import { api } from '../api'
import type { Paginated } from '../api'
import type { B2BOrg, QuoteRequest } from '../types/b2b.types'

export const b2bApi = {
  register: (body: unknown) => api.post<{ orgId: string }>('/b2b/register', body),
  getMe: () => api.get<B2BOrg>('/b2b/me'),
  listQuotes: () => api.get<Paginated<QuoteRequest>>('/b2b/quotes'),
  getQuote: (id: string) => api.get<QuoteRequest>(`/b2b/quotes/${id}`),
  submitQuote: (body: unknown) => api.post<QuoteRequest>('/b2b/quotes', body),
  acceptQuote: (id: string) => api.post<{ orderId: string }>(`/b2b/quotes/${id}/accept`),
}
