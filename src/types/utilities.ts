import { PaginationMeta } from "./types"

/**
 * Filter configuration types for search and filtering functionality
 */
export interface FilterFieldConfig {
  name: string
  type: "entity" | "string" | "static" | "search"
  staticOptions?: string[]
  allowNone?: boolean
  responseKey?: string
  displayName?: string
  defaultValue?: string | null
}

export interface FilterConfig {
  entityName: string
  fields: FilterFieldConfig[]
  responseKeys: Record<string, string>
}

export type FilterConfigs = Record<string, FilterConfig>

/**
 * Pagination utility types
 */
export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginationOptions {
  page: number
  per_page: number
}

/**
 * Sorting and ordering types
 */
export interface SortOption {
  field: string
  direction: "asc" | "desc"
  label?: string
}

export interface SortConfig {
  options: SortOption[]
  defaultSort: string
  defaultOrder: "asc" | "desc"
}

/**
 * Search and query utility types
 */
export interface SearchParams {
  query?: string
  filters?: Record<string, unknown>
  sort?: string
  order?: string
  page?: number
  per_page?: number
}

export interface QueryBuilder {
  search: string
  filters: Record<string, string | boolean | null>
  sort: string
  order: string
  page: number
  per_page: number
}

/**
 * Data transformation utility types
 */
export interface Transformer<TInput, TOutput> {
  transform: (input: TInput) => TOutput
  reverse?: (output: TOutput) => TInput
}

export interface Validator<T> {
  validate: (value: T) => boolean
  errorMessage?: string
}

export interface Formatter<T> {
  format: (value: T) => string
  parse?: (formatted: string) => T
}

/**
 * Generic utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type KeyValuePair<T = string> = {
  key: string
  value: T
  label?: string
}

/**
 * Async operation utility types
 */
export interface AsyncOperation<T> {
  isLoading: boolean
  data?: T
  error?: string
  timestamp?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry?: number
}

export type CacheStrategy = "memory" | "localStorage" | "sessionStorage"

/**
 * Event handling utility types
 */
export interface EventHandler<T = unknown> {
  (event: T): void | Promise<void>
}

export interface AsyncEventHandler<T = unknown> {
  (event: T): Promise<void>
}

/**
 * Utility function types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Debounced<T extends (...args: any[]) => any> = T & {
  cancel: () => void
  flush: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Throttled<T extends (...args: any[]) => any> = T & {
  cancel: () => void
}

/**
 * API utility types
 */
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: Record<string, unknown>
}

/**
 * URL and routing utility types
 */
export interface RouteParams {
  [key: string]: string | number | boolean | undefined
}

export interface QueryParams {
  [key: string]: string | string[] | number | boolean | undefined
}

/**
 * File and upload utility types
 */
export interface FileUpload {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
  url?: string
}

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}
