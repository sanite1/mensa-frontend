import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ApiErrorBody } from '../api'

/**
 * Extracts a clean error shape from any thrown error. Matches the backend
 * envelope `{ statusCode, message, details? }`.
 */
export function handleApiError(error: unknown): ApiErrorBody {
  const axiosError = error as AxiosError<ApiErrorBody>

  if (axiosError.response?.data?.message) {
    return axiosError.response.data
  }

  if (axiosError.message) {
    return { statusCode: 0, message: axiosError.message }
  }

  return { statusCode: 0, message: 'Something went wrong. Please try again.' }
}

/**
 * Toasts the parsed error message. Drop-in `onError` for React Query
 * mutations — `onError: handleApiError` alone parses the error and then
 * discards it, which is how upload failures went silent.
 */
export function toastApiError(error: unknown): void {
  toast.error(handleApiError(error).message)
}
