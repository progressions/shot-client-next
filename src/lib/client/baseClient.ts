import axios, { AxiosResponse, AxiosRequestConfig } from "axios"
import { etagCache } from "./etagCache"

interface ClientDependencies {
  jwt?: string
}

interface CacheOptions {
  cache?: "default" | "no-store" | "force-cache"
  revalidate?: number
  /** Disable ETag caching for this request */
  skipEtag?: boolean
}

type Parameters_ = Record<string, unknown>

/**
 * Factory to create low-level HTTP client with JWT authentication.
 * Provides get, post, patch, delete methods that automatically include auth headers.
 *
 * @param dependencies - Configuration object
 * @param dependencies.jwt - JWT token for Authorization header
 *
 * @returns Object with HTTP methods:
 * - `get(url, params?, cacheOptions?)` - GET request with query params
 * - `getPublic(url, params?, cacheOptions?)` - GET without auth (public endpoints)
 * - `post(url, data?, cacheOptions?)` - POST with JSON body
 * - `patch(url, data?, cacheOptions?)` - PATCH with JSON body
 * - `delete(url, params?)` - DELETE request
 * - `request(method, url, data?, cacheOptions?)` - Generic request
 * - `requestFormData(method, url, formData)` - Multipart form upload
 *
 * @example
 * ```tsx
 * const base = createBaseClient({ jwt: token })
 * const response = await base.get("/api/v2/characters", { active: true })
 * ```
 */
export function createBaseClient({ jwt }: ClientDependencies) {
  async function get<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    if (!jwt) {
      console.error("No JWT provided, cannot make GET request", url)
      throw new Error("No JWT provided")
    }
    const headers: { [key: string]: string } = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    }
    if (cacheOptions.cache === "no-store") {
      headers["Cache-Control"] =
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    } else if (cacheOptions.cache === "force-cache") {
      headers["Cache-Control"] = `max-age=${cacheOptions.revalidate || 3600}`
    }

    // Add If-None-Match header if we have a cached ETag (unless skipEtag is set)
    const useEtag = !cacheOptions.skipEtag && cacheOptions.cache !== "no-store"
    if (useEtag) {
      const cachedEtag = etagCache.getEtag(
        url,
        parameters as Record<string, unknown>
      )
      if (cachedEtag) {
        headers["If-None-Match"] = cachedEtag
      }
    }

    const config: AxiosRequestConfig = {
      url: url,
      method: "GET",
      params: parameters,
      headers: headers,
      proxy: false,
      // Tell axios not to throw on 304 responses
      validateStatus: status =>
        (status >= 200 && status < 300) || status === 304,
    }

    const response = await axios(config)

    // Handle 304 Not Modified - return cached data
    if (response.status === 304 && useEtag) {
      const cachedData = etagCache.getData<T>(
        url,
        parameters as Record<string, unknown>
      )
      if (cachedData) {
        return {
          ...response,
          status: 200,
          data: cachedData,
        } as AxiosResponse<T>
      }
    }

    // Store ETag and response data for future conditional requests
    if (useEtag && response.status === 200) {
      const etag = response.headers["etag"]
      if (etag) {
        etagCache.set(
          url,
          etag,
          response.data,
          parameters as Record<string, unknown>
        )
      }
    }

    return response
  }

  async function getPublic<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    const headers: { [key: string]: string } = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }
    if (cacheOptions.cache === "no-store") {
      headers["Cache-Control"] =
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    } else if (cacheOptions.cache === "force-cache") {
      headers["Cache-Control"] = `max-age=${cacheOptions.revalidate || 3600}`
    }
    const config: AxiosRequestConfig = {
      url: url,
      method: "GET",
      params: parameters,
      headers: headers,
      proxy: false,
    }
    return await axios(config)
  }

  async function postPublic<T>(
    url: string,
    data: Parameters_ = {}
  ): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      url: url,
      method: "POST",
      data: data,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      proxy: false,
    }
    return await axios(config)
  }

  async function post<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    const response = await request<T>("POST", url, parameters, cacheOptions)
    // Invalidate cache for this resource type on create
    invalidateCacheForUrl(url)
    return response
  }

  async function patch<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    const response = await request<T>("PATCH", url, parameters, cacheOptions)
    // Invalidate cache for this specific resource on update
    etagCache.invalidate(url)
    // Also invalidate the list endpoint
    invalidateCacheForUrl(url)
    return response
  }

  async function delete_<T>(
    url: string,
    parameters: Parameters_ = {}
  ): Promise<AxiosResponse<T>> {
    const response = await axios({
      url: url,
      method: "DELETE",
      params: parameters,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      proxy: false,
    })
    // Invalidate cache for this resource on delete
    etagCache.invalidate(url)
    invalidateCacheForUrl(url)
    return response
  }

  /**
   * Invalidate cache entries for a resource URL pattern
   * e.g., /api/v2/characters/123 -> invalidates /api/v2/characters*
   */
  function invalidateCacheForUrl(url: string): void {
    // Extract base resource path (e.g., /api/v2/characters)
    const match = url.match(/^(\/api\/v\d+\/[^/]+)/)
    if (match) {
      etagCache.invalidatePattern(match[1])
    }
  }

  async function request<T>(
    method: string,
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    const headers: { [key: string]: string } = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    }
    if (cacheOptions.cache === "no-store") {
      headers["Cache-Control"] =
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    } else if (cacheOptions.cache === "force-cache") {
      headers["Cache-Control"] = `max-age=${cacheOptions.revalidate || 3600}`
    }
    const config: AxiosRequestConfig = {
      url: url,
      method: method,
      headers: headers,
      proxy: false,
    }
    if (method === "GET") {
      config.params = parameters
    } else {
      config.data = parameters
    }
    return await axios(config)
  }

  async function requestFormData<T>(
    method: string,
    url: string,
    formData: FormData
  ): Promise<AxiosResponse<T>> {
    return await axios({
      url: url,
      method: method,
      data: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${jwt}`,
      },
      proxy: false,
    }).catch(error => {
      console.error("Error in requestFormData:", error)
      throw error
    })
  }

  return {
    get,
    getPublic,
    post,
    postPublic,
    patch,
    delete: delete_,
    request,
    requestFormData,
    /** Access to ETag cache for manual invalidation */
    cache: etagCache,
  }
}

// Re-export etagCache for direct access
export { etagCache }
