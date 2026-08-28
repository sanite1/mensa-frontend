// partner.api.ts — Partner programme (individual referrals).

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { ApiResponse, Paginated } from '../api'
import { toastApiError } from '../helpers/handleApiError'
import type {
  AdminPayoutListItem,
  PartnerBankAccount,
  PartnerPayoutStatus,
  PartnerSelfDashboard,
  PartnerStatus,
  PartnerSummary,
} from '../types/partner.types'

// ── DTOs ─────────────────────────────────────────────────────────

export interface ApplyAsPartnerInput {
  name: string
  email: string
  phone: string
  socialHandle?: string
  notes?: string
}

export interface CompletePartnerOnboardingInput {
  token: string
  password: string
  referralCode?: string
  bankAccount: PartnerBankAccount
}

export interface AdminListPartnersParams {
  status?: PartnerStatus
  q?: string
  page?: number
  pageSize?: number
}

export interface AdminListPayoutsParams {
  status?: PartnerPayoutStatus
  page?: number
  pageSize?: number
}

export interface AdminApprovePartnerInput {
  commissionRate?: number
}

export interface AdminRejectPartnerInput {
  rejectionReason?: string
}

export interface AdminUpdatePartnerInput {
  commissionRate?: number
  status?: 'active' | 'suspended'
}

export interface AdminMarkPayoutPaidInput {
  paymentReference: string
  adminNote?: string
}

export interface AdminRejectPayoutInput {
  adminNote?: string
}

// ── Keys ─────────────────────────────────────────────────────────

export const partnerKeys = {
  all: ['partners'] as const,
  self: () => [...partnerKeys.all, 'self'] as const,
  onboardingVerify: (token: string) => [...partnerKeys.all, 'onboarding', token] as const,
  adminList: (params: AdminListPartnersParams) =>
    [...partnerKeys.all, 'admin', 'list', params] as const,
  adminDetail: (id: string) => [...partnerKeys.all, 'admin', 'detail', id] as const,
  adminPayouts: (params: AdminListPayoutsParams) =>
    [...partnerKeys.all, 'admin', 'payouts', params] as const,
}

// ── Public: apply ───────────────────────────────────────────────

const applyAsPartnerFn = async (
  body: ApplyAsPartnerInput,
): Promise<ApiResponse<{ partner: PartnerSummary }>> => {
  return api.post<{ partner: PartnerSummary }>('/partners/apply', body)
}

export const useApplyAsPartner = () =>
  useMutation({
    mutationFn: applyAsPartnerFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Application received.')
    },
    onError: toastApiError,
  })

// ── Public: onboarding verify + complete ────────────────────────

interface OnboardingVerifyData {
  partner: { name: string; email: string; commissionRate: number }
}

const verifyOnboardingTokenFn = async (
  token: string,
): Promise<ApiResponse<OnboardingVerifyData>> => {
  return api.get<OnboardingVerifyData>('/partners/onboarding', {
    params: { token },
  })
}

export const useVerifyOnboardingToken = (token: string | undefined) =>
  useQuery({
    queryKey: token ? partnerKeys.onboardingVerify(token) : ['partners', 'onboarding', 'noop'],
    queryFn: () => verifyOnboardingTokenFn(token as string),
    enabled: !!token,
    retry: false,
  })

const completeOnboardingFn = async (
  body: CompletePartnerOnboardingInput,
): Promise<ApiResponse<{ email: string; referralCode: string }>> => {
  return api.post<{ email: string; referralCode: string }>('/partners/onboarding/complete', body)
}

export const useCompletePartnerOnboarding = () =>
  useMutation({
    mutationFn: completeOnboardingFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Welcome aboard.')
    },
    onError: toastApiError,
  })

// ── Authed: partner self dashboard ──────────────────────────────

const getPartnerSelfFn = async (): Promise<ApiResponse<PartnerSelfDashboard>> => {
  return api.get<PartnerSelfDashboard>('/partners/me')
}

export const usePartnerDashboard = (enabled = true) =>
  useQuery({
    queryKey: partnerKeys.self(),
    queryFn: getPartnerSelfFn,
    enabled,
    staleTime: 30_000,
  })

const updateBankAccountFn = async (
  body: PartnerBankAccount,
): Promise<ApiResponse<{ bankAccount: PartnerBankAccount }>> => {
  return api.patch<{ bankAccount: PartnerBankAccount }>('/partners/me/bank-account', body)
}

export const useUpdateBankAccount = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateBankAccountFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Bank account updated.')
      qc.invalidateQueries({ queryKey: partnerKeys.self() })
    },
    onError: toastApiError,
  })
}

const requestPayoutFn = async (): Promise<ApiResponse<{ payoutRequest: unknown }>> => {
  return api.post<{ payoutRequest: unknown }>('/partners/me/payouts')
}

export const useRequestPayout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: requestPayoutFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Payout requested.')
      qc.invalidateQueries({ queryKey: partnerKeys.self() })
    },
    onError: toastApiError,
  })
}

// ── Admin: partners ─────────────────────────────────────────────

const adminListPartnersFn = async (
  params: AdminListPartnersParams,
): Promise<ApiResponse<Paginated<PartnerSummary>>> => {
  return api.get<Paginated<PartnerSummary>>('/admin/partnerships/individuals', {
    params,
  })
}

export const useAdminPartners = (params: AdminListPartnersParams) =>
  useQuery({
    queryKey: partnerKeys.adminList(params),
    queryFn: () => adminListPartnersFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

const adminGetPartnerFn = async (id: string): Promise<ApiResponse<{ partner: PartnerSummary }>> => {
  return api.get<{ partner: PartnerSummary }>(`/admin/partnerships/individuals/${id}`)
}

export const useAdminPartner = (id: string | undefined) =>
  useQuery({
    queryKey: id ? partnerKeys.adminDetail(id) : ['partners', 'admin', 'detail', 'noop'],
    queryFn: () => adminGetPartnerFn(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })

const approvePartnerFn = async ({
  id,
  body,
}: {
  id: string
  body: AdminApprovePartnerInput
}): Promise<ApiResponse<{ partner: PartnerSummary }>> => {
  return api.patch<{ partner: PartnerSummary }>(
    `/admin/partnerships/individuals/${id}/approve`,
    body,
  )
}

export const useApprovePartner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: approvePartnerFn,
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Partner approved.')
      qc.invalidateQueries({ queryKey: partnerKeys.all })
      qc.invalidateQueries({ queryKey: partnerKeys.adminDetail(vars.id) })
    },
    onError: toastApiError,
  })
}

const rejectPartnerFn = async ({
  id,
  body,
}: {
  id: string
  body: AdminRejectPartnerInput
}): Promise<ApiResponse<{ partner: PartnerSummary }>> => {
  return api.patch<{ partner: PartnerSummary }>(
    `/admin/partnerships/individuals/${id}/reject`,
    body,
  )
}

export const useRejectPartner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rejectPartnerFn,
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Partner rejected.')
      qc.invalidateQueries({ queryKey: partnerKeys.all })
      qc.invalidateQueries({ queryKey: partnerKeys.adminDetail(vars.id) })
    },
    onError: toastApiError,
  })
}

const updatePartnerFn = async ({
  id,
  body,
}: {
  id: string
  body: AdminUpdatePartnerInput
}): Promise<ApiResponse<{ partner: PartnerSummary }>> => {
  return api.patch<{ partner: PartnerSummary }>(`/admin/partnerships/individuals/${id}`, body)
}

export const useUpdatePartner = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updatePartnerFn,
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Partner updated.')
      qc.invalidateQueries({ queryKey: partnerKeys.all })
      qc.invalidateQueries({ queryKey: partnerKeys.adminDetail(vars.id) })
    },
    onError: toastApiError,
  })
}

// ── Admin: payouts ──────────────────────────────────────────────

const adminListPayoutsFn = async (
  params: AdminListPayoutsParams,
): Promise<ApiResponse<Paginated<AdminPayoutListItem>>> => {
  return api.get<Paginated<AdminPayoutListItem>>('/admin/partnerships/payouts', { params })
}

export const useAdminPayouts = (params: AdminListPayoutsParams) =>
  useQuery({
    queryKey: partnerKeys.adminPayouts(params),
    queryFn: () => adminListPayoutsFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

const markPayoutPaidFn = async ({
  id,
  body,
}: {
  id: string
  body: AdminMarkPayoutPaidInput
}): Promise<ApiResponse<{ payoutRequest: unknown }>> => {
  return api.patch<{ payoutRequest: unknown }>(`/admin/partnerships/payouts/${id}/pay`, body)
}

export const useMarkPayoutPaid = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markPayoutPaidFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Payout marked paid.')
      qc.invalidateQueries({ queryKey: partnerKeys.all })
    },
    onError: toastApiError,
  })
}

const rejectPayoutFn = async ({
  id,
  body,
}: {
  id: string
  body: AdminRejectPayoutInput
}): Promise<ApiResponse<{ payoutRequest: unknown }>> => {
  return api.patch<{ payoutRequest: unknown }>(`/admin/partnerships/payouts/${id}/reject`, body)
}

export const useRejectPayout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rejectPayoutFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Payout rejected.')
      qc.invalidateQueries({ queryKey: partnerKeys.all })
    },
    onError: toastApiError,
  })
}
