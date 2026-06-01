// ═══════════════════════════════════════════════════════════════
// newsletter.api.ts — public subscribe + admin list / delete
// ═══════════════════════════════════════════════════════════════

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { ApiResponse, Paginated } from '../api'
import { handleApiError } from '../helpers/handleApiError'

export type NewsletterSource =
  | 'footer'
  | 'mobile_drawer'
  | 'partner_apply'
  | 'checkout'
  | 'other'

export type NewsletterStatus = 'subscribed' | 'unsubscribed'

export interface NewsletterSubscriber {
  _id: string
  email: string
  source: NewsletterSource
  status: NewsletterStatus
  subscribedAt: string
  unsubscribedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SubscribeInput {
  email: string
  source?: NewsletterSource
}

export interface AdminListSubscribersParams {
  status?: NewsletterStatus
  source?: NewsletterSource
  q?: string
  page?: number
  pageSize?: number
}

export const newsletterKeys = {
  all: ['newsletter'] as const,
  adminList: (params: AdminListSubscribersParams) =>
    [...newsletterKeys.all, 'admin', 'list', params] as const,
}

// ── Public: subscribe ───────────────────────────────────────────

const subscribeFn = async (
  body: SubscribeInput,
): Promise<ApiResponse<{ subscribed: true }>> => {
  return api.post<{ subscribed: true }>('/newsletter/subscribe', body)
}

export const useSubscribeToNewsletter = () =>
  useMutation({
    mutationFn: subscribeFn,
    onSuccess: (res) => {
      toast.success(res.message || 'You are on the list.')
    },
    onError: handleApiError,
  })

// ── Admin: list ─────────────────────────────────────────────────

const adminListSubscribersFn = async (
  params: AdminListSubscribersParams,
): Promise<ApiResponse<Paginated<NewsletterSubscriber>>> => {
  return api.get<Paginated<NewsletterSubscriber>>(
    '/admin/newsletter/subscribers',
    { params },
  )
}

export const useAdminSubscribers = (params: AdminListSubscribersParams) =>
  useQuery({
    queryKey: newsletterKeys.adminList(params),
    queryFn: () => adminListSubscribersFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

// ── Admin: delete ──────────────────────────────────────────────

const adminDeleteSubscriberFn = async (
  id: string,
): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(`/admin/newsletter/subscribers/${id}`)
}

export const useDeleteSubscriber = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminDeleteSubscriberFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Subscriber removed.')
      qc.invalidateQueries({ queryKey: newsletterKeys.all })
    },
    onError: handleApiError,
  })
}
