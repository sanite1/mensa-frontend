import type { AxiosError } from 'axios'

export interface ApiErrorShape {
  code: string
  message: string
  details?: Record<string, unknown>
}

export function handleApiError(error: unknown): ApiErrorShape {
  const axiosError = error as AxiosError<{ error: ApiErrorShape }>

  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error
  }

  if (axiosError.message) {
    return { code: 'NETWORK_ERROR', message: axiosError.message }
  }

  return { code: 'UNKNOWN_ERROR', message: 'Something went wrong. Please try again.' }
}
