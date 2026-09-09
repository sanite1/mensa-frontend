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
  createdAt: string
  updatedAt: string
}

export interface SubmitLeadInput {
  name: string
  email: string
  answers: Record<string, string>
  resultCode: LeadResultCode
}

export interface AdminListLeadsParams {
  status?: LeadStatus
  q?: string
  page?: number
  pageSize?: number
}

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
): Promise<ApiResponse<Paginated<StarterSetLead>>> => {
  return api.get<Paginated<StarterSetLead>>('/admin/leads', { params })
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
