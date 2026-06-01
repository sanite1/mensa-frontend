// ═══════════════════════════════════════════════════════════════
// contact.api.ts — public POST /contact
// ═══════════════════════════════════════════════════════════════

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { ApiResponse } from '../api'
import { handleApiError } from '../helpers/handleApiError'

export type ContactTopic = 'order' | 'product' | 'partnership' | 'press' | 'other'

export interface ContactMessageInput {
  name: string
  email: string
  topic: ContactTopic
  orderNumber?: string
  message: string
}

const submitContactFn = async (
  body: ContactMessageInput,
): Promise<ApiResponse<{ received: true }>> => {
  return api.post<{ received: true }>('/contact', body)
}

export const useSubmitContact = () =>
  useMutation({
    mutationFn: submitContactFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Your message is on its way.')
    },
    onError: handleApiError,
  })
