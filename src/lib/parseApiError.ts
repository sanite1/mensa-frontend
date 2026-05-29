import type { AxiosError } from 'axios'
import type { ApiErrorBody } from './network/api'

export function parseApiError(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorBody>
  return (
    axiosError.response?.data?.message ??
    (error instanceof Error ? error.message : 'Something went wrong.')
  )
}
