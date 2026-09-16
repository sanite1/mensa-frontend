// invoice.api.ts — admin invoices: list, builder CRUD, send, void, product picker, settings.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { api } from '../api'
import type { Paginated } from '../api'
import { toastApiError } from '../helpers/handleApiError'

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'void'
export type InvoiceLineKind = 'catalogue' | 'custom'

export interface InvoiceLine {
  _id?: string
  kind: InvoiceLineKind
  productId?: string | null
  variantId?: string | null
  description: string
  variantLabel?: string
  sku?: string
  unitPrice: number
  qty: number
  lineTotal: number
}

export interface InvoiceCustomer {
  name: string
  email: string
  phone?: string
  address?: string
  userId?: string | null
  b2bOrgId?: string | null
}

export interface InvoiceTotals {
  subtotal: number
  discount: number
  vat: number
  shipping: number
  total: number
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  status: InvoiceStatus
  customer: InvoiceCustomer
  lines: InvoiceLine[]
  discountKobo: number
  vatPercent: number | null
  shippingKobo: number
  shippingLabel: string
  notes: string
  dueDate: string | null
  totals: InvoiceTotals
  accessToken: string
  stockReserved: boolean
  sentAt?: string | null
  viewedAt?: string | null
  paidAt?: string | null
  voidedAt?: string | null
  orderId?: string | null
  createdAt: string
  updatedAt: string
}

export interface InvoiceLineInput {
  kind: InvoiceLineKind
  productId?: string
  variantId?: string
  description?: string
  unitPrice?: number
  qty: number
}

export interface UpsertInvoiceInput {
  customer: InvoiceCustomer
  lines: InvoiceLineInput[]
  discountKobo?: number
  vatPercent?: number | null
  shippingKobo?: number
  shippingLabel?: string
  notes?: string
  dueDate?: string | null
}

export interface AdminListInvoicesParams {
  status?: InvoiceStatus | 'overdue'
  q?: string
  page?: number
  pageSize?: number
}

export interface InvoiceProductPick {
  productId: string
  name: string
  slug: string
  isSoldOut: boolean
  variants: Array<{
    variantId: string
    label: string
    sku: string
    stockCount: number
    unitPrice: number
    isActive: boolean
  }>
}

export interface InvoiceSettings {
  bankName: string
  accountName: string
  accountNumber: string
  contactPhone: string
  contactAddress: string
  contactWebsite: string
  defaultVatPercent: number | null
}

/** True for sent or viewed invoices past their due date. Derived, never stored. */
export function isInvoiceOverdue(invoice: Pick<Invoice, 'status' | 'dueDate'>): boolean {
  if (invoice.status !== 'sent' && invoice.status !== 'viewed') return false
  if (!invoice.dueDate) return false
  return new Date(invoice.dueDate).getTime() < Date.now()
}

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (params: AdminListInvoicesParams) => [...invoiceKeys.all, 'list', params] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
  products: (q: string) => [...invoiceKeys.all, 'products', q] as const,
  settings: () => [...invoiceKeys.all, 'settings'] as const,
}

// ── List / detail ───────────────────────────────────────────────

export const useAdminInvoices = (params: AdminListInvoicesParams) =>
  useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => api.get<Paginated<Invoice>>('/admin/invoices', { params }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })

export const useAdminInvoice = (id: string | undefined) =>
  useQuery({
    queryKey: invoiceKeys.detail(id ?? ''),
    queryFn: () => api.get<{ invoice: Invoice }>(`/admin/invoices/${id}`),
    enabled: !!id,
  })

// ── Product picker ──────────────────────────────────────────────

export const useInvoiceProducts = (q: string) =>
  useQuery({
    queryKey: invoiceKeys.products(q),
    queryFn: () =>
      api.get<{ products: InvoiceProductPick[] }>('/admin/invoices/products', {
        params: { q: q || undefined },
      }),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })

// ── Mutations ───────────────────────────────────────────────────

export const useCreateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertInvoiceInput) =>
      api.post<{ invoice: Invoice }>('/admin/invoices', body),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice draft saved.')
      qc.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: toastApiError,
  })
}

export const useUpdateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; body: UpsertInvoiceInput }) =>
      api.put<{ invoice: Invoice }>(`/admin/invoices/${input.id}`, input.body),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice updated.')
      qc.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: toastApiError,
  })
}

export const useSendInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<{ invoice: Invoice }>(`/admin/invoices/${id}/send`),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice sent.')
      qc.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: toastApiError,
  })
}

export const useVoidInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<{ invoice: Invoice }>(`/admin/invoices/${id}/void`),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice voided.')
      qc.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: toastApiError,
  })
}

export const useRemindInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<{ invoice: Invoice }>(`/admin/invoices/${id}/remind`),
    onSuccess: (res) => {
      toast.success(res.message || 'Reminder sent.')
      qc.invalidateQueries({ queryKey: invoiceKeys.all })
    },
    onError: toastApiError,
  })
}

// ── Public: the customer's view ─────────────────────────────────

export interface PublicInvoiceData {
  /** The public read includes the payment block so the page can tell
   *  whether an attempt was ever started and verify it on load. */
  invoice: Invoice & { payment?: { attempts?: number } }
  settings: InvoiceSettings
}

export interface InvoicePaymentInit {
  reference: string
  accessCode: string
  authorizationUrl: string
  amount: number
  publicKey: string
  email: string
}

/** Silent mutations, the invoice page owns the messaging. */
export const usePayInvoice = () =>
  useMutation({
    mutationFn: (token: string) => api.post<InvoicePaymentInit>(`/invoices/${token}/pay`),
  })

export const useVerifyInvoice = () =>
  useMutation({
    mutationFn: (token: string) => api.post<{ invoice: Invoice }>(`/invoices/${token}/verify`),
  })

export const usePublicInvoice = (token: string | undefined) =>
  useQuery({
    queryKey: [...invoiceKeys.all, 'public', token ?? ''] as const,
    queryFn: () => api.get<PublicInvoiceData>(`/invoices/${token}`),
    enabled: !!token,
    retry: false,
  })

// ── Settings ────────────────────────────────────────────────────

export const useInvoiceSettings = () =>
  useQuery({
    queryKey: invoiceKeys.settings(),
    queryFn: () => api.get<InvoiceSettings>('/admin/invoices/settings'),
    staleTime: 60_000,
  })

export const useUpdateInvoiceSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: InvoiceSettings) =>
      api.put<InvoiceSettings>('/admin/invoices/settings', body),
    onSuccess: (res) => {
      toast.success(res.message || 'Invoice settings saved.')
      qc.invalidateQueries({ queryKey: invoiceKeys.settings() })
    },
    onError: toastApiError,
  })
}
