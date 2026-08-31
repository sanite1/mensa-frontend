// admin.api.ts — cross-cutting admin endpoints.

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '../api'
import type { ApiResponse } from '../api'
import type { UserAddress } from '../types/user.types'

export type CustomerRole = 'customer' | 'admin' | 'b2b_admin' | 'b2b_member'

export interface AdminLowStockEntry {
  productSlug: string
  productName: string
  sku: string
  variantLabel: string
  stockCount: number
  lowStockThreshold: number
}

export interface AdminRecentOrder {
  _id: string
  orderNumber: string
  customerEmail: string
  totalKobo: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund'
  fulfilmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

export interface AdminStats {
  todaysOrders: number
  weekRevenueKobo: number
  pendingFulfilment: number
  lowStockCount: number
  lowStock: AdminLowStockEntry[]
  recentOrders: AdminRecentOrder[]
  newsletterSubscribers: number
  newsletterNewThisWeek: number
}

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  reports: (days: number) => [...adminKeys.all, 'reports', days] as const,
}

const getAdminStatsFn = async (): Promise<ApiResponse<AdminStats>> => {
  return api.get<AdminStats>('/admin/stats')
}

export const useAdminStats = () =>
  useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStatsFn,
    staleTime: 60_000,
  })

// ── Reports (charts + summaries) ─────────────────────────────────

export interface AdminReportDay {
  date: string
  revenueKobo: number
  orders: number
}

export interface AdminReports {
  days: number
  summary: {
    totalRevenueKobo: number
    totalPaidOrders: number
    avgOrderValueKobo: number
    windowRevenueKobo: number
    windowOrders: number
    totalCustomers: number
  }
  revenueByDay: AdminReportDay[]
  ordersByStatus: { status: string; count: number }[]
  topProducts: { productName: string; units: number; revenueKobo: number }[]
  categoryRevenue: { category: string; revenueKobo: number }[]
}

const getAdminReportsFn = async (days: number): Promise<ApiResponse<AdminReports>> => {
  return api.get<AdminReports>('/admin/reports', { params: { days } })
}

export const useAdminReports = (days: number) =>
  useQuery({
    queryKey: adminKeys.reports(days),
    queryFn: () => getAdminReportsFn(days),
    staleTime: 60_000,
  })

// ── Customers ────────────────────────────────────────────────────

export interface AdminCustomerListItem {
  _id: string
  name: string
  email: string
  phone: string
  role: CustomerRole
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
  orderCount: number
  lifetimeValueKobo: number
}

export interface AdminCustomersListParams {
  q?: string
  role?: CustomerRole
  page?: number
  pageSize?: number
}

export interface AdminCustomersListResponseData {
  items: AdminCustomerListItem[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export interface AdminCustomerDetailOrder {
  _id: string
  orderNumber: string
  totalKobo: number
  paymentStatus: string
  fulfilmentStatus: string
  createdAt: string
}

export interface AdminCustomerDetail {
  _id: string
  name: string
  email: string
  phone: string
  role: CustomerRole
  emailVerified: boolean
  addresses: UserAddress[]
  createdAt: string
  lastLoginAt: string | null
  orderCount: number
  lifetimeValueKobo: number
  orders: AdminCustomerDetailOrder[]
}

export const customerKeys = {
  all: ['admin', 'customers'] as const,
  list: (params: AdminCustomersListParams) => [...customerKeys.all, 'list', params] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
}

const listCustomersFn = async (
  params: AdminCustomersListParams,
): Promise<ApiResponse<AdminCustomersListResponseData>> => {
  return api.get<AdminCustomersListResponseData>('/admin/customers', { params })
}

export const useAdminCustomers = (params: AdminCustomersListParams) =>
  useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomersFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

const getCustomerFn = async (
  id: string,
): Promise<ApiResponse<{ customer: AdminCustomerDetail }>> => {
  return api.get<{ customer: AdminCustomerDetail }>(`/admin/customers/${id}`)
}

export const useAdminCustomer = (id: string | undefined) =>
  useQuery({
    queryKey: id ? customerKeys.detail(id) : ['admin', 'customers', 'detail', 'noop'],
    queryFn: () => getCustomerFn(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })
