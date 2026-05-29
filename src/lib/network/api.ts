import { axios } from './axios'
import type { AxiosRequestConfig } from 'axios'

// ── Shared response envelope (matches backend ApiResponse) ──
export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data?: T
}

export interface ApiErrorBody {
  statusCode: number
  message: string
  details?: Record<string, string>
}

export interface Paginated<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Typed JSON wrapper around the raw axios instance. Each method returns the
 * parsed `ApiResponse<T>` envelope directly (no `.data` step at call sites).
 *
 * For multipart/form-data uploads, bypass this and import `axios` from
 * `./axios` so the FormData boundary is set correctly.
 */
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await axios.get<ApiResponse<T>>(url, config)
    return res.data
  },
  post: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    const res = await axios.post<ApiResponse<T>>(url, body, config)
    return res.data
  },
  put: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    const res = await axios.put<ApiResponse<T>>(url, body, config)
    return res.data
  },
  patch: async <T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> => {
    const res = await axios.patch<ApiResponse<T>>(url, body, config)
    return res.data
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const res = await axios.delete<ApiResponse<T>>(url, config)
    return res.data
  },
}
