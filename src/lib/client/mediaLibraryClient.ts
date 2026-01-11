import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  MediaImage,
  MediaLibraryListResponse,
  MediaLibraryFilters,
  BulkDeleteResult,
  DownloadInfo,
  MediaImageEntityType,
  MediaSearchResponse,
  AiTagsListResponse,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
}

export function createMediaLibraryClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, post, delete: delete_ } = createBaseClient(deps)

  /**
   * List all images in the current campaign with optional filtering and sorting
   */
  async function getMediaLibrary(
    filters?: MediaLibraryFilters
  ): Promise<AxiosResponse<MediaLibraryListResponse>> {
    const params = new URLSearchParams()

    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status)
    }
    if (filters?.source && filters.source !== "all") {
      params.append("source", filters.source)
    }
    if (filters?.entity_type) {
      params.append("entity_type", filters.entity_type)
    }
    if (filters?.sort) {
      params.append("sort", filters.sort)
    }
    if (filters?.order) {
      params.append("order", filters.order)
    }
    if (filters?.page) {
      params.append("page", String(filters.page))
    }
    if (filters?.per_page) {
      params.append("per_page", String(filters.per_page))
    }

    const queryString = params.toString()
    const url = queryString
      ? `${apiV2.mediaLibrary()}?${queryString}`
      : apiV2.mediaLibrary()

    return get(url)
  }

  /**
   * Get a single image by ID
   */
  async function getMediaImage(id: string): Promise<AxiosResponse<MediaImage>> {
    return get(apiV2.mediaLibrary(id))
  }

  /**
   * Delete a single image (removes from ImageKit and database)
   */
  async function deleteMediaImage(id: string): Promise<AxiosResponse<void>> {
    return delete_(apiV2.mediaLibrary(id))
  }

  /**
   * Bulk delete multiple images
   */
  async function bulkDeleteMediaImages(
    ids: string[]
  ): Promise<AxiosResponse<BulkDeleteResult>> {
    return post(apiV2.mediaLibraryBulkDelete(), { ids })
  }

  /**
   * Duplicate an image (creates copy in ImageKit and new database record)
   */
  async function duplicateMediaImage(
    id: string
  ): Promise<AxiosResponse<MediaImage>> {
    return post(apiV2.mediaLibraryDuplicate(id), {})
  }

  /**
   * Attach an orphan image to an entity
   */
  async function attachMediaImage(
    id: string,
    entityType: MediaImageEntityType,
    entityId: string
  ): Promise<AxiosResponse<MediaImage>> {
    return post(apiV2.mediaLibraryAttach(id), {
      entity_type: entityType,
      entity_id: entityId,
    })
  }

  /**
   * Get download URL for an image
   */
  async function getDownloadUrl(
    id: string
  ): Promise<AxiosResponse<DownloadInfo>> {
    return get(apiV2.mediaLibraryDownload(id))
  }

  /**
   * Search images by AI-generated tags
   * @param query - Comma or space-separated search terms
   * @param options - Pagination options
   */
  async function searchByTags(
    query: string,
    options?: { page?: number; per_page?: number }
  ): Promise<AxiosResponse<MediaSearchResponse>> {
    const params = new URLSearchParams()
    params.append("q", query)

    if (options?.page) {
      params.append("page", String(options.page))
    }
    if (options?.per_page) {
      params.append("per_page", String(options.per_page))
    }

    return get(`${apiV2.mediaLibrarySearch()}?${params.toString()}`)
  }

  /**
   * Get all unique AI tag names for autocomplete
   */
  async function getAiTags(): Promise<AxiosResponse<AiTagsListResponse>> {
    return get(apiV2.mediaLibraryAiTags())
  }

  return {
    getMediaLibrary,
    getMediaImage,
    deleteMediaImage,
    bulkDeleteMediaImages,
    duplicateMediaImage,
    attachMediaImage,
    getDownloadUrl,
    searchByTags,
    getAiTags,
  }
}
