// order.api.ts — raw async functions + React Query hooks.

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../api'
import { handleApiError } from '../helpers/handleApiError'
import type { ApiResponse } from '../api'
import type {
  InitializeCheckoutInput,
  InitializeCheckoutResponseData,
  ListOrdersParams,
  ListOrdersResponseData,
  OrderResponseData,
  ShippingRatesInput,
  ShippingRatesResponseData,
  UpdateOrderFulfilmentInput,
} from '../types/order.types'

// ── Query keys ───────────────────────────────────────────────────
export const orderKeys = {
  all: ['orders'] as const,
  myList: (params?: ListOrdersParams) =>
    [...orderKeys.all, 'mine', 'list', params ?? {}] as const,
  myDetail: (id: string) => [...orderKeys.all, 'mine', 'detail', id] as const,
  track: (orderNumber: string, email: string) =>
    [...orderKeys.all, 'track', orderNumber, email] as const,
  adminList: (params?: ListOrdersParams) =>
    [...orderKeys.all, 'admin', 'list', params ?? {}] as const,
  adminDetail: (id: string) =>
    [...orderKeys.all, 'admin', 'detail', id] as const,
  shippingRates: (input: ShippingRatesInput) =>
    [...orderKeys.all, 'shippingRates', input] as const,
}

// ─── 1. POST /api/v1/checkout/shipping-rates ─────

const getShippingRatesFn = async (
  body: ShippingRatesInput,
): Promise<ApiResponse<ShippingRatesResponseData>> => {
  return api.post<ShippingRatesResponseData>('/checkout/shipping-rates', body)
}

/** Fetch live shipping options, enabled only once the destination is complete and the cart has lines. */
export const useShippingRates = (
  input: ShippingRatesInput | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: input
      ? orderKeys.shippingRates(input)
      : [...orderKeys.all, 'shippingRates', 'idle'],
    queryFn: () => getShippingRatesFn(input as ShippingRatesInput),
    enabled:
      enabled &&
      !!input &&
      input.lines.length > 0 &&
      !!input.destination.state &&
      !!input.destination.city,
    staleTime: 30_000,
  })

// ─── 2. POST /api/v1/checkout/initialize ─────────

const initializeCheckoutFn = async (
  body: InitializeCheckoutInput,
): Promise<ApiResponse<InitializeCheckoutResponseData>> => {
  return api.post<InitializeCheckoutResponseData>('/checkout/initialize', body)
}

export const useInitializeCheckout = () =>
  useMutation({
    mutationFn: initializeCheckoutFn,
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })

// ─── 2b. POST /api/v1/checkout/verify/:reference ────
// Backend verifies with Paystack directly so the confirmation page gets an answer
// without waiting on the async webhook. Idempotent server side.

const verifyCheckoutFn = async (
  reference: string,
): Promise<ApiResponse<OrderResponseData>> => {
  return api.post<OrderResponseData>(`/checkout/verify/${reference}`)
}

export const useVerifyCheckout = () =>
  useMutation({ mutationFn: verifyCheckoutFn })

// ─── 3. GET /api/v1/orders  (auth, current user) ────

const listMyOrdersFn = async (
  params?: ListOrdersParams,
): Promise<ApiResponse<ListOrdersResponseData>> => {
  return api.get<ListOrdersResponseData>('/orders', { params })
}

export const useMyOrders = (params?: ListOrdersParams, enabled = true) =>
  useQuery({
    queryKey: orderKeys.myList(params),
    queryFn: () => listMyOrdersFn(params),
    placeholderData: keepPreviousData,
    enabled,
  })

// ─── 4. GET /api/v1/orders/:id  (auth, current user) ────

const getMyOrderFn = async (
  id: string,
): Promise<ApiResponse<OrderResponseData>> => {
  return api.get<OrderResponseData>(`/orders/${id}`)
}

export const useMyOrder = (id: string | undefined) =>
  useQuery({
    queryKey: orderKeys.myDetail(id ?? ''),
    queryFn: () => getMyOrderFn(id as string),
    enabled: !!id,
  })

// ─── 5. GET /api/v1/orders/track/:orderNumber?email=  (public) ────

const trackOrderFn = async (
  orderNumber: string,
  email: string,
): Promise<ApiResponse<OrderResponseData>> => {
  return api.get<OrderResponseData>(`/orders/track/${orderNumber}`, {
    params: { email },
  })
}

/** Public order lookup, the email acts as a soft PIN. Disabled until both fields are filled so partial requests never fire. */
export const useTrackOrder = (
  orderNumber: string | undefined,
  email: string | undefined,
  enabled = true,
) =>
  useQuery({
    queryKey: orderKeys.track(orderNumber ?? '', email ?? ''),
    queryFn: () => trackOrderFn(orderNumber as string, email as string),
    enabled: enabled && !!orderNumber && !!email,
    retry: false,
  })

// ─── 6. GET /api/v1/admin/orders  (admin) ────────

const adminListOrdersFn = async (
  params?: ListOrdersParams,
): Promise<ApiResponse<ListOrdersResponseData>> => {
  return api.get<ListOrdersResponseData>('/admin/orders', { params })
}

export const useAdminOrders = (params?: ListOrdersParams) =>
  useQuery({
    queryKey: orderKeys.adminList(params),
    queryFn: () => adminListOrdersFn(params),
    placeholderData: keepPreviousData,
  })

// ─── 7. GET /api/v1/admin/orders/:id  (admin) ────

const adminGetOrderFn = async (
  id: string,
): Promise<ApiResponse<OrderResponseData>> => {
  return api.get<OrderResponseData>(`/admin/orders/${id}`)
}

export const useAdminOrder = (id: string | undefined) =>
  useQuery({
    queryKey: orderKeys.adminDetail(id ?? ''),
    queryFn: () => adminGetOrderFn(id as string),
    enabled: !!id,
  })

// ─── 8. PATCH /api/v1/admin/orders/:id/fulfilment  (admin) ────

const updateOrderFulfilmentFn = async ({
  id,
  payload,
}: {
  id: string
  payload: UpdateOrderFulfilmentInput
}): Promise<ApiResponse<OrderResponseData>> => {
  return api.patch<OrderResponseData>(`/admin/orders/${id}/fulfilment`, payload)
}

export const useUpdateOrderFulfilment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateOrderFulfilmentFn,
    onSuccess: (res, vars) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: orderKeys.adminDetail(vars.id) })
      queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'admin', 'list'] })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}
