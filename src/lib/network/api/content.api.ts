// ═══════════════════════════════════════════════════════════════
// content.api.ts — public + admin endpoints for ContentPost
// ═══════════════════════════════════════════════════════════════

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '../api'
import { axios } from '../axios'
import type { ApiResponse, Paginated } from '../api'
import { toastApiError } from '../helpers/handleApiError'
import type {
  ContentCategory,
  ContentKind,
  ContentPost,
} from '../types/content.types'

export interface ContentListParams {
  kind?: ContentKind
  category?: ContentCategory
  status?: 'draft' | 'published'
  q?: string
  page?: number
  pageSize?: number
}

export interface CreateContentPostInput {
  slug: string
  kind: ContentKind
  title: string
  eyebrow?: string
  category: ContentCategory
  excerpt?: string
  body?: string
  coverImage?: { url: string; publicId?: string; alt: string }
  authorName: string
  authorBio?: string
  readMinutes?: number
  status?: 'draft' | 'published'
}

export type UpdateContentPostInput = Partial<CreateContentPostInput>

export const contentKeys = {
  all: ['content'] as const,
  publicList: (params: ContentListParams) =>
    [...contentKeys.all, 'public', 'list', params] as const,
  publicDetail: (slug: string) =>
    [...contentKeys.all, 'public', 'detail', slug] as const,
  adminList: (params: ContentListParams) =>
    [...contentKeys.all, 'admin', 'list', params] as const,
  adminDetail: (id: string) =>
    [...contentKeys.all, 'admin', 'detail', id] as const,
}

// ── Public ───────────────────────────────────────────────────────

const listPublicContentFn = async (
  params: ContentListParams,
): Promise<ApiResponse<Paginated<ContentPost>>> => {
  return api.get<Paginated<ContentPost>>('/content', { params })
}

export const useContentList = (params: ContentListParams = {}) =>
  useQuery({
    queryKey: contentKeys.publicList(params),
    queryFn: () => listPublicContentFn(params),
    staleTime: 60_000,
  })

const getPublicContentFn = async (
  slug: string,
): Promise<ApiResponse<{ post: ContentPost }>> => {
  return api.get<{ post: ContentPost }>(`/content/${slug}`)
}

export const useContentPost = (slug: string | undefined) =>
  useQuery({
    queryKey: slug ? contentKeys.publicDetail(slug) : ['content', 'public', 'detail', 'noop'],
    queryFn: () => getPublicContentFn(slug as string),
    enabled: !!slug,
    staleTime: 60_000,
  })

// ── Admin ────────────────────────────────────────────────────────

const adminListContentFn = async (
  params: ContentListParams,
): Promise<ApiResponse<Paginated<ContentPost>>> => {
  return api.get<Paginated<ContentPost>>('/admin/content', { params })
}

export const useAdminContent = (params: ContentListParams = {}) =>
  useQuery({
    queryKey: contentKeys.adminList(params),
    queryFn: () => adminListContentFn(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

const adminGetContentFn = async (
  id: string,
): Promise<ApiResponse<{ post: ContentPost }>> => {
  return api.get<{ post: ContentPost }>(`/admin/content/${id}`)
}

export const useAdminContentPost = (id: string | undefined) =>
  useQuery({
    queryKey: id ? contentKeys.adminDetail(id) : ['content', 'admin', 'detail', 'noop'],
    queryFn: () => adminGetContentFn(id as string),
    enabled: !!id,
    staleTime: 30_000,
  })

const adminCreateContentFn = async (
  body: CreateContentPostInput,
): Promise<ApiResponse<{ post: ContentPost }>> => {
  return api.post<{ post: ContentPost }>('/admin/content', body)
}

export const useCreateContentPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminCreateContentFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Post created.')
      qc.invalidateQueries({ queryKey: contentKeys.all })
    },
    onError: toastApiError,
  })
}

const adminUpdateContentFn = async ({
  id,
  body,
}: {
  id: string
  body: UpdateContentPostInput
}): Promise<ApiResponse<{ post: ContentPost }>> => {
  return api.put<{ post: ContentPost }>(`/admin/content/${id}`, body)
}

export const useUpdateContentPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminUpdateContentFn,
    onSuccess: (res, vars) => {
      toast.success(res.message || 'Post updated.')
      qc.invalidateQueries({ queryKey: contentKeys.all })
      qc.invalidateQueries({ queryKey: contentKeys.adminDetail(vars.id) })
    },
    onError: toastApiError,
  })
}

const adminDeleteContentFn = async (
  id: string,
): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(`/admin/content/${id}`)
}

export const useDeleteContentPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminDeleteContentFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Post deleted.')
      qc.invalidateQueries({ queryKey: contentKeys.all })
    },
    onError: toastApiError,
  })
}

// ══════════════════════════════════════════════
// POST /api/v1/admin/content/upload-image  (multipart)
// Standalone cover upload — returns { url, publicId } for the editor to
// stash in the post's coverImage on save.
// ══════════════════════════════════════════════

const uploadContentImageFn = async (
  file: File,
): Promise<ApiResponse<{ url: string; publicId: string }>> => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await axios.post<ApiResponse<{ url: string; publicId: string }>>(
    '/admin/content/upload-image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return res.data
}

export const useUploadContentImage = () => {
  return useMutation({
    mutationFn: uploadContentImageFn,
    onSuccess: (res) => {
      toast.success(res.message || 'Image uploaded.')
    },
    onError: toastApiError,
  })
}
