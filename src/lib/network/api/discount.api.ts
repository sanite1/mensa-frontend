// discount.api.ts — discount endpoints. Public surface is one apply preview mutation, everything else is admin only.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../api'
import { handleApiError } from '../helpers/handleApiError'
import type { ApiResponse } from '../api'
import type {
  ApplyDiscountInput,
  ApplyDiscountResponseData,
  CreateDiscountInput,
  DiscountResponseData,
  ListDiscountsParams,
  ListDiscountsResponseData,
  UpdateDiscountInput,
} from '../types/discount.types'

export const discountKeys = {
  all: ['discounts'] as const,
  adminList: (params?: ListDiscountsParams) =>
    [...discountKeys.all, 'admin', 'list', params ?? {}] as const,
  adminDetail: (id: string) => [...discountKeys.all, 'admin', 'detail', id] as const,
}

// ─── 1. POST /api/v1/checkout/apply-discount (public preview) ────

const applyDiscountFn = async (
  body: ApplyDiscountInput,
): Promise<ApiResponse<ApplyDiscountResponseData>> => {
  return api.post<ApplyDiscountResponseData>('/checkout/apply-discount', body)
}

// No error toast here, checkout renders the message inline next to the code input.
export const useApplyDiscount = () => useMutation({ mutationFn: applyDiscountFn })

// ─── 2. GET /api/v1/admin/discounts ──────────────

const adminListDiscountsFn = async (
  params?: ListDiscountsParams,
): Promise<ApiResponse<ListDiscountsResponseData>> => {
  return api.get<ListDiscountsResponseData>('/admin/discounts', { params })
}

export const useAdminDiscounts = (params?: ListDiscountsParams) =>
  useQuery({
    queryKey: discountKeys.adminList(params),
    queryFn: () => adminListDiscountsFn(params),
    placeholderData: keepPreviousData,
  })

// ─── 3. GET /api/v1/admin/discounts/:id ──────────

const adminGetDiscountFn = async (id: string): Promise<ApiResponse<DiscountResponseData>> => {
  return api.get<DiscountResponseData>(`/admin/discounts/${id}`)
}

export const useAdminDiscount = (id: string | undefined) =>
  useQuery({
    queryKey: discountKeys.adminDetail(id ?? ''),
    queryFn: () => adminGetDiscountFn(id as string),
    enabled: !!id,
  })

// ─── 4. POST /api/v1/admin/discounts ─────────────

const adminCreateDiscountFn = async (
  payload: CreateDiscountInput,
): Promise<ApiResponse<DiscountResponseData>> => {
  return api.post<DiscountResponseData>('/admin/discounts', payload)
}

export const useCreateDiscount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminCreateDiscountFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 5. PUT /api/v1/admin/discounts/:id ──────────

const adminUpdateDiscountFn = async ({
  id,
  payload,
}: {
  id: string
  payload: UpdateDiscountInput
}): Promise<ApiResponse<DiscountResponseData>> => {
  return api.put<DiscountResponseData>(`/admin/discounts/${id}`, payload)
}

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminUpdateDiscountFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 6. DELETE /api/v1/admin/discounts/:id ───────

const adminDeleteDiscountFn = async (id: string): Promise<ApiResponse<null>> => {
  return api.delete<null>(`/admin/discounts/${id}`)
}

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminDeleteDiscountFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: discountKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}
