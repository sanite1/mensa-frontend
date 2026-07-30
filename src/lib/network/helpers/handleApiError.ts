import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ApiErrorBody } from '../api'

/** Extracts the backend error envelope `{ statusCode, message, details? }` from any thrown error. */
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

/** Toasts the parsed error message. Use this as mutation `onError`, bare `handleApiError` parses then discards the error, which is how upload failures went silent. */
export function toastApiError(error: unknown): void {
  toast.error(handleApiError(error).message)
}
