// product.api.ts — raw async functions + React Query hooks.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../api'
import { axios } from '../axios'
import { handleApiError } from '../helpers/handleApiError'
import type { ApiResponse } from '../api'
import type {
  CreateProductInput,
  ListProductsResponseData,
  ProductImageResponseData,
  ProductListParams,
  ProductResponseData,
  UpdateProductInput,
} from '../types/product.types'

// ── Query keys (centralised for cache invalidation) ──
export const productKeys = {
  all: ['products'] as const,
  publicList: (params?: ProductListParams) =>
    [...productKeys.all, 'public', 'list', params ?? {}] as const,
  publicDetail: (slug: string) => [...productKeys.all, 'public', 'detail', slug] as const,
  adminList: (params?: ProductListParams) =>
    [...productKeys.all, 'admin', 'list', params ?? {}] as const,
  adminDetail: (slug: string) => [...productKeys.all, 'admin', 'detail', slug] as const,
}

// ─── 1. GET /api/v1/products  (public, paginated) ────

const listProductsFn = async (
  params?: ProductListParams,
): Promise<ApiResponse<ListProductsResponseData>> => {
  return api.get<ListProductsResponseData>('/products', { params })
}

export const useProducts = (params?: ProductListParams) =>
  useQuery({
    queryKey: productKeys.publicList(params),
    queryFn: () => listProductsFn(params),
    placeholderData: keepPreviousData,
  })

// ─── 2. GET /api/v1/products/:slug  (public) ─────

const getProductFn = async (slug: string): Promise<ApiResponse<ProductResponseData>> => {
  return api.get<ProductResponseData>(`/products/${slug}`)
}

export const useProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: productKeys.publicDetail(slug ?? ''),
    queryFn: () => getProductFn(slug as string),
    enabled: !!slug,
  })

// ─── 3. GET /api/v1/admin/products  (admin, includes inactive) ────

const adminListProductsFn = async (
  params?: ProductListParams,
): Promise<ApiResponse<ListProductsResponseData>> => {
  return api.get<ListProductsResponseData>('/admin/products', { params })
}

export const useAdminProducts = (params?: ProductListParams) =>
  useQuery({
    queryKey: productKeys.adminList(params),
    queryFn: () => adminListProductsFn(params),
    placeholderData: keepPreviousData,
  })

// ─── 4. GET /api/v1/admin/products/:slug  (admin) ────

const adminGetProductFn = async (
  slug: string,
): Promise<ApiResponse<ProductResponseData>> => {
  return api.get<ProductResponseData>(`/admin/products/${slug}`)
}

export const useAdminProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: productKeys.adminDetail(slug ?? ''),
    queryFn: () => adminGetProductFn(slug as string),
    enabled: !!slug,
  })

// ─── 5. POST /api/v1/admin/products  (admin create) ────

const createProductFn = async (
  payload: CreateProductInput,
): Promise<ApiResponse<ProductResponseData>> => {
  return api.post<ProductResponseData>('/admin/products', payload)
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProductFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 6. PUT /api/v1/admin/products/:slug  (admin update) ────

const updateProductFn = async ({
  slug,
  payload,
}: {
  slug: string
  payload: UpdateProductInput
}): Promise<ApiResponse<ProductResponseData>> => {
  return api.put<ProductResponseData>(`/admin/products/${slug}`, payload)
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProductFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 7. DELETE /api/v1/admin/products/:slug  (admin soft delete) ────

const deleteProductFn = async (slug: string): Promise<ApiResponse<null>> => {
  return api.delete<null>(`/admin/products/${slug}`)
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProductFn,
    onSuccess: (res) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 8. POST /api/v1/admin/products/:slug/images  (multipart) ────

const uploadProductImageFn = async ({
  slug,
  file,
  alt,
}: {
  slug: string
  file: File
  alt?: string
}): Promise<ApiResponse<ProductImageResponseData>> => {
  const formData = new FormData()
  formData.append('image', file)
  if (alt) formData.append('alt', alt)
  const res = await axios.post<ApiResponse<ProductImageResponseData>>(
    `/admin/products/${slug}/images`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export const useUploadProductImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadProductImageFn,
    onSuccess: (res, vars) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.adminDetail(vars.slug) })
      queryClient.invalidateQueries({ queryKey: productKeys.publicDetail(vars.slug) })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 9. DELETE /api/v1/admin/products/:slug/images/:imageId ────

const removeProductImageFn = async ({
  slug,
  imageId,
}: {
  slug: string
  imageId: string
}): Promise<ApiResponse<ProductResponseData>> => {
  return api.delete<ProductResponseData>(`/admin/products/${slug}/images/${imageId}`)
}

export const useRemoveProductImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeProductImageFn,
    onSuccess: (res, vars) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.adminDetail(vars.slug) })
      queryClient.invalidateQueries({ queryKey: productKeys.publicDetail(vars.slug) })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}

// ─── 10. PUT /api/v1/admin/products/:slug/images/order ────

const reorderProductImagesFn = async ({
  slug,
  orderedImageIds,
}: {
  slug: string
  orderedImageIds: string[]
}): Promise<ApiResponse<ProductResponseData>> => {
  return api.put<ProductResponseData>(`/admin/products/${slug}/images/order`, {
    orderedImageIds,
  })
}

export const useReorderProductImages = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderProductImagesFn,
    onSuccess: (res, vars) => {
      toast.success(res.message)
      queryClient.invalidateQueries({ queryKey: productKeys.adminDetail(vars.slug) })
      queryClient.invalidateQueries({ queryKey: productKeys.publicDetail(vars.slug) })
    },
    onError: (error) => {
      toast.error(handleApiError(error).message)
    },
  })
}
