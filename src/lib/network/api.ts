import api from './axios'
import type { AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const res = await api.get<ApiResponse<T>>(url, config)
  return res.data
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const res = await api.post<ApiResponse<T>>(url, body, config)
  return res.data
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const res = await api.put<ApiResponse<T>>(url, body, config)
  return res.data
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const res = await api.delete<ApiResponse<T>>(url, config)
  return res.data
}

export async function getPaginated<T>(url: string, config?: AxiosRequestConfig): Promise<PaginatedResponse<T>> {
  const res = await api.get<PaginatedResponse<T>>(url, config)
  return res.data
}
