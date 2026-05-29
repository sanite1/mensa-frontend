import { api } from '../api'
import type { Paginated } from '../api'
import type { ContentPost } from '../types/content.types'

export const contentApi = {
  list: (params?: { kind?: 'journal' | 'education'; category?: string }) =>
    api.get<Paginated<ContentPost>>('/content', { params }),
  getBySlug: (slug: string) => api.get<ContentPost>(`/content/${slug}`),
}
