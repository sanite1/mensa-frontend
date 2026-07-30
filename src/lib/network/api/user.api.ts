// user.api.ts — customer /me surface, currently address book only.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../api'
import { handleApiError } from '../helpers/handleApiError'
import type { ApiResponse } from '../api'
import type {
  AddressResponseData,
  AddressesResponseData,
  UpdateUserAddressInput,
  UserAddressInput,
} from '../types/user.types'

export const userKeys = {
  all: ['user'] as const,
  addresses: () => [...userKeys.all, 'addresses'] as const,
}

// ─── 1. GET /api/v1/users/me/addresses ───────────

const listMyAddressesFn = async (): Promise<ApiResponse<AddressesResponseData>> => {
  return api.get<AddressesResponseData>('/users/me/addresses')
}

export const useMyAddresses = (enabled = true) =>
  useQuery({
    queryKey: userKeys.addresses(),
    queryFn: listMyAddressesFn,
    enabled,
  })

// ─── 2. POST /api/v1/users/me/addresses ──────────

const addMyAddressFn = async (
  payload: UserAddressInput,
): Promise<ApiResponse<AddressResponseData>> => {
  return api.post<AddressResponseData>('/users/me/addresses', payload)
}

interface UseAddMyAddressOptions {
  /** When true, suppress success/error toasts. Useful for the silent
   *  fire-and-forget save from checkout — the page already toasts on
   *  payment success and the address is a side concern. */
  silent?: boolean
}

export const useAddMyAddress = (opts: UseAddMyAddressOptions = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addMyAddressFn,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() })
      if (!opts.silent) toast.success(res.message)
    },
    onError: (error) => {
      if (!opts.silent) toast.error(handleApiError(error).message)
    },
  })
}

// ─── 3. PUT /api/v1/users/me/addresses/:id ───────

const updateMyAddressFn = async ({
  id,
  payload,
}: {
  id: string
  payload: UpdateUserAddressInput
}): Promise<ApiResponse<AddressResponseData>> => {
  return api.put<AddressResponseData>(`/users/me/addresses/${id}`, payload)
}

export const useUpdateMyAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyAddressFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 4. PUT /api/v1/users/me/addresses/:id/default ────

const setDefaultAddressFn = async (
  id: string,
): Promise<ApiResponse<AddressesResponseData>> => {
  return api.put<AddressesResponseData>(`/users/me/addresses/${id}/default`)
}

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setDefaultAddressFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 5. DELETE /api/v1/users/me/addresses/:id ────

const deleteMyAddressFn = async (
  id: string,
): Promise<ApiResponse<AddressesResponseData>> => {
  return api.delete<AddressesResponseData>(`/users/me/addresses/${id}`)
}

export const useDeleteMyAddress = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMyAddressFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: userKeys.addresses() })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}
