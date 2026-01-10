/**
 * Standard API Response Wrapper
 * Follows REST API best practices for consistent response structure
 *
 * This type is shared between backend, web, and mobile applications
 * to ensure consistent API response handling.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  message: string
  data?: T
  errors?: Record<string, string[]> | string[]
  timestamp: string
  path: string
}

/**
 * Helper type to extract the data type from an ApiResponse
 */
export type ApiResponseData<T> = T extends ApiResponse<infer D> ? D : never

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  meta: PaginationMeta
}
