import axios, { AxiosResponse, AxiosRequestConfig } from "axios"

interface ClientDependencies {
  jwt?: string
}

interface CacheOptions {
  cache?: "default" | "no-store" | "force-cache"
  revalidate?: number
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
    const config: AxiosRequestConfig = {
      url: url,
      method: "GET",
      params: parameters,
      headers: headers,
      proxy: false,
    }
    return await axios(config)
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

  async function post<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    return await request("POST", url, parameters, cacheOptions)
  }

  async function patch<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    return await request("PATCH", url, parameters, cacheOptions)
  }

  async function delete_<T>(
    url: string,
    parameters: Parameters_ = {}
  ): Promise<AxiosResponse<T>> {
    return await axios({
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
    patch,
    delete: delete_,
    request,
    requestFormData,
  }
}
