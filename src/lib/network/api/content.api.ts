import { get, getPaginated } from '../api'
import type { ContentPost } from '../types/content.types'

export const contentApi = {
  list:      (params?: { kind?: 'journal' | 'education'; category?: string }) => getPaginated<ContentPost>('/content', { params }),
  getBySlug: (slug: string) => get<ContentPost>(`/content/${slug}`),
}
