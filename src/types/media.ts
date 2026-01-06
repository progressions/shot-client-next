/**
 * Media Library types for AI-generated images
 */

export type MediaImageStatus = "orphan" | "attached"

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

export interface MediaImage {
  id: string
  campaign_id: string
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
  generated_by_id?: string
  inserted_at: string
  updated_at: string
}

export interface MediaLibraryListResponse {
  images: MediaImage[]
  meta: {
    page: number
    per_page: number
    total_count: number
    total_pages: number
  }
  stats: {
    total: number
    orphan: number
    attached: number
  }
}

export interface MediaLibraryFilters {
  status?: MediaImageStatus | "all"
  entity_type?: MediaImageEntityType | ""
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
