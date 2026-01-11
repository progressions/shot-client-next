/**
 * Media Library types for all campaign images (uploaded and AI-generated)
 */

export type MediaImageStatus = "orphan" | "attached"

export type MediaImageSource = "upload" | "ai_generated"

export type MediaImageEntityType =
  | "Character"
  | "Vehicle"
  | "Weapon"
  | "Schtick"
  | "Site"
  | "Faction"
  | "Party"
  | "Fight"
  | "User"

/**
 * AI-generated tag from Google Vision via ImageKit
 */
export interface AiTag {
  name: string
  confidence: number
  source: string
}

export interface MediaImage {
  id: string
  campaign_id: string
  source: MediaImageSource
  entity_type: MediaImageEntityType | null
  entity_id: string | null
  entity_name?: string | null
  status: MediaImageStatus
  imagekit_file_id?: string
  imagekit_url: string
  imagekit_file_path?: string
  thumbnail_url?: string
  filename?: string
  content_type?: string
  byte_size?: number
  width?: number
  height?: number
  prompt?: string
  ai_provider?: string
  ai_tags?: AiTag[]
  generated_by_id?: string
  uploaded_by_id?: string
  inserted_at: string
  updated_at: string
}

export interface MediaLibraryStats {
  total: number
  orphan: number
  attached: number
  uploaded: number
  ai_generated: number
  total_size_bytes: number
}

export interface MediaLibraryListResponse {
  images: MediaImage[]
  meta: {
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
  stats: MediaLibraryStats
}

export type MediaLibrarySortField =
  | "inserted_at"
  | "updated_at"
  | "filename"
  | "byte_size"
  | "entity_type"

export type SortOrder = "asc" | "desc"

export interface MediaLibraryFilters {
  status?: MediaImageStatus | "all"
  source?: MediaImageSource | "all"
  entity_type?: MediaImageEntityType | ""
  sort?: MediaLibrarySortField
  order?: SortOrder
  page?: number
  per_page?: number
}

export interface BulkDeleteResult {
  deleted: string[]
  failed: string[]
}

export interface DownloadInfo {
  download_url: string
  filename: string
}

/**
 * Response from AI tag search endpoint
 */
export interface MediaSearchResponse {
  images: MediaImage[]
  meta: {
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
}

/**
 * Response from AI tags list endpoint (for autocomplete)
 */
export interface AiTagsListResponse {
  tags: string[]
}
