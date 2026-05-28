import type { AxiosError } from 'axios'

export function parseApiError(error: unknown): string {
  const axiosError = error as AxiosError<{ error: { message: string } }>
  return (
    axiosError.response?.data?.error?.message ??
    (error instanceof Error ? error.message : 'Something went wrong.')
  )
}
