// lead.api.ts — starter set finder leads. Public submit + admin list / status / delete.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { ApiResponse, Paginated } from '../api'
import { toastApiError } from '../helpers/handleApiError'

export type LeadResultCode = 'PADS' | 'PANT1' | 'PANT3' | 'PANT5' | 'PANT1_PADS' | 'PANT3_PADS'

export type LeadStatus = 'new' | 'contacted' | 'ordered'

export interface StarterSetLead {
  _id: string
  name: string
  email: string
  answers: Record<string, string>
  resultCode: LeadResultCode
  status: LeadStatus
  orderNumber?: string | null
  orderedAt?: string | null
  contactedAt?: string | null
  retakes: number
  /** Personal 10 percent code. Null on leads captured before codes existed. */
  discountCode?: string | null
  discountIssuedAt?: string | null
  discountExpiresAt?: string | null
  discountRedeemedAt?: string | null
  discountRedeemedOrderNumber?: string | null
  reminderSentAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SubmitLeadInput {
  name: string
  email: string
  answers: Record<string, string>
  resultCode: LeadResultCode
  /** The result page reasoning, reused in the code email. */
  reason?: string
  /** Storefront path of the recommended product. */
  shopPath?: string
}

export type LeadCodeFilter = 'redeemed' | 'unredeemed' | 'expired'

export interface LeadCodeStats {
  issued: number
  redeemed: number
  expired: number
}

export interface AdminListLeadsParams {
  status?: LeadStatus
  code?: LeadCodeFilter
  q?: string
  page?: number
  pageSize?: number
}

export type AdminLeadsList = Paginated<StarterSetLead> & { codeStats: LeadCodeStats }

export const leadKeys = {
  all: ['leads'] as const,
  adminList: (params: AdminListLeadsParams) => [...leadKeys.all, 'admin', 'list', params] as const,
}

// ── Public: submit from the quiz ────────────────────────────────
// Deliberately silent on both success and error, the quiz page decides what
// to show. Lead capture must never block the result.

const submitLeadFn = async (body: SubmitLeadInput): Promise<ApiResponse<{ received: true }>> => {
  return api.post<{ received: true }>('/leads/starter-set', body)
}

export const useSubmitStarterSetLead = () =>
  useMutation({
    mutationFn: submitLeadFn,
  })

// ── Admin: list ─────────────────────────────────────────────────

const adminListLeadsFn = async (
  params: AdminListLeadsParams,
): Promise<ApiResponse<AdminLeadsList>> => {
  return api.get<AdminLeadsList>('/admin/leads', { params })
}

export const useAdminLeads = (params: AdminListLeadsParams) =>
  useQuery({
    queryKey: leadKeys.adminList(params),
    queryFn: () => adminListLeadsFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

// ── Admin: update status ────────────────────────────────────────

const adminUpdateLeadStatusFn = async (input: {
  id: string
  status: 'new' | 'contacted'
}): Promise<ApiResponse<{ id: string; status: LeadStatus }>> => {
  return api.patch<{ id: string; status: LeadStatus }>(`/admin/leads/${input.id}`, {
    status: input.status,
  })
}

export const useUpdateLeadStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminUpdateLeadStatusFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Lead updated.')
      qc.invalidateQueries({ queryKey: leadKeys.all })
    },
    onError: toastApiError,
  })
}

// ── Admin: delete ───────────────────────────────────────────────

const adminDeleteLeadFn = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(`/admin/leads/${id}`)
}

export const useDeleteLead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminDeleteLeadFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Lead removed.')
      qc.invalidateQueries({ queryKey: leadKeys.all })
    },
    onError: toastApiError,
  })
}
