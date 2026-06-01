// ═══════════════════════════════════════════════════════════════
// b2b.api.ts — partnerships (B2BOrg) endpoints
//
// Public surface:
//   - submitB2BOrg  (POST /b2b/apply)
//
// Admin surface:
//   - useAdminPartnerships  (list + filter by verificationStatus)
//   - useAdminPartnership   (single org)
//   - useVerifyPartnership  (verify / reject)
//
// Quotes, pricing tiers, and invoicing land in a later sprint.
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
import type { B2BOrg, B2BOrgType, B2BVerificationStatus } from '../types/b2b.types'

export interface SubmitB2BOrgInput {
  name: string
  type: B2BOrgType
  registrationNumber?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  notes?: string
}

export interface AdminPartnershipsListParams {
  verificationStatus?: B2BVerificationStatus
  q?: string
  page?: number
  pageSize?: number
}

export interface VerifyPartnershipInput {
  verificationStatus: 'verified' | 'rejected'
  verificationNote?: string
}

export const partnershipKeys = {
  all: ['partnerships'] as const,
  adminList: (params: AdminPartnershipsListParams) =>
    [...partnershipKeys.all, 'admin', 'list', params] as const,
  adminDetail: (id: string) =>
    [...partnershipKeys.all, 'admin', 'detail', id] as const,
}

// ── Public ───────────────────────────────────────────────────────

const submitB2BOrgFn = async (
  body: SubmitB2BOrgInput,
): Promise<ApiResponse<{ org: B2BOrg }>> => {
  return api.post<{ org: B2BOrg }>('/b2b/apply', body)
}

export const useSubmitB2BOrg = () =>
  useMutation({
    mutationFn: submitB2BOrgFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Application received.')
    },
    onError: handleApiError,
  })

// ── Admin ────────────────────────────────────────────────────────

const adminListPartnershipsFn = async (
  params: AdminPartnershipsListParams,
): Promise<ApiResponse<Paginated<B2BOrg>>> => {
  return api.get<Paginated<B2BOrg>>('/admin/partnerships', { params })
}

export const useAdminPartnerships = (params: AdminPartnershipsListParams) =>
  useQuery({
    queryKey: partnershipKeys.adminList(params),
    queryFn: () => adminListPartnershipsFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

const adminGetPartnershipFn = async (
  id: string,
): Promise<ApiResponse<{ org: B2BOrg }>> => {
  return api.get<{ org: B2BOrg }>(`/admin/partnerships/${id}`)
}

export const useAdminPartnership = (id: string | undefined) =>
  useQuery({
    queryKey: id
      ? partnershipKeys.adminDetail(id)
      : ['partnerships', 'admin', 'detail', 'noop'],
    queryFn: () => adminGetPartnershipFn(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })

const verifyPartnershipFn = async ({
  id,
  body,
}: {
  id: string
  body: VerifyPartnershipInput
}): Promise<ApiResponse<{ org: B2BOrg }>> => {
  return api.patch<{ org: B2BOrg }>(`/admin/partnerships/${id}/verify`, body)
}

export const useVerifyPartnership = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: verifyPartnershipFn,
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Partnership updated.')
      qc.invalidateQueries({ queryKey: partnershipKeys.all })
      qc.invalidateQueries({ queryKey: partnershipKeys.adminDetail(vars.id) })
    },
    onError: handleApiError,
  })
}
