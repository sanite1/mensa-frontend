// shipping.api.ts — admin managed delivery options (shipping settings).

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { ApiResponse } from '../api'
import { toastApiError } from '../helpers/handleApiError'

export type ShippingCoverage = 'all' | 'states'

export interface ShippingOption {
  /** Stable id, blank for options the admin just added. */
  id: string
  name: string
  feeKobo: number
  etaMinDays: number
  etaMaxDays: number
  coverage: ShippingCoverage
  states: string[]
  enabled: boolean
  sortOrder: number
}

export interface ShippingSettings {
  freeDeliveryThresholdKobo: number | null
  options: ShippingOption[]
  /** True while the built in defaults are serving checkout (never saved). */
  isDefault: boolean
}

export interface UpdateShippingSettingsInput {
  freeDeliveryThresholdKobo: number | null
  options: ShippingOption[]
}

export const shippingKeys = {
  all: ['shipping'] as const,
  settings: () => [...shippingKeys.all, 'settings'] as const,
}

// ── Admin: read ─────────────────────────────────────────────────

const getShippingSettingsFn = async (): Promise<ApiResponse<ShippingSettings>> => {
  return api.get<ShippingSettings>('/admin/shipping-settings')
}

export const useShippingSettings = () =>
  useQuery({
    queryKey: shippingKeys.settings(),
    queryFn: getShippingSettingsFn,
    staleTime: 30_000,
  })

// ── Admin: update ───────────────────────────────────────────────

const updateShippingSettingsFn = async (
  body: UpdateShippingSettingsInput,
): Promise<ApiResponse<ShippingSettings>> => {
  return api.put<ShippingSettings>('/admin/shipping-settings', body)
}

export const useUpdateShippingSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateShippingSettingsFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Shipping settings saved.')
      qc.invalidateQueries({ queryKey: shippingKeys.all })
    },
    onError: toastApiError,
  })
}
