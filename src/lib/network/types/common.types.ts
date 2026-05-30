// Shared response shapes used across multiple resource types.

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
