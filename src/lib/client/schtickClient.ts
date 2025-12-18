import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Schtick,
  SchticksResponse,
  Character,
  CacheOptions,
  Parameters_,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createSchtickClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, delete: delete_, requestFormData } = createBaseClient(deps)

  async function getSchticksBatch(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    return post(`${apiV2.schticks()}/batch`, { ...parameters }, cacheOptions)
  }

  async function getSchtickPaths(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ paths: string[] }>> {
    const query = queryParams(parameters)
    return get(`${apiV2.schtickPaths()}?${query}`, {}, cacheOptions)
  }

  async function getSchtickCategories(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ categories: string[] }>> {
    const query = queryParams(parameters)
    return get(`${apiV2.schtickCategories()}?${query}`, {}, cacheOptions)
  }

  async function getSchticks(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.schticks()}?${query}`, {}, cacheOptions)
  }

  async function getSchtick(
    schtick: Schtick | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Schtick>> {
    return get(apiV2.schticks(schtick), {}, cacheOptions)
  }

  async function createSchtick(
    formData: FormData
  ): Promise<AxiosResponse<Schtick>> {
    return requestFormData("POST", `${apiV2.schticks()}`, formData)
  }

  async function updateSchtick(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Schtick>> {
    return requestFormData("PATCH", `${apiV2.schticks({ id })}`, formData)
  }

  async function deleteSchtick(
    schtick: Schtick,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.schticks(schtick), params)
  }

  async function getCharacterSchticks(
    character: Character | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    const query = queryParams(parameters)
    return get(
      `${apiV2.characterSchticks(character)}?${query}`,
      {},
      cacheOptions
    )
  }

  async function addSchtick(
    character: Character | string,
    schtick: Schtick
  ): Promise<AxiosResponse<Character>> {
    return post(apiV2.characterSchticks(character), { schtick: schtick })
  }

  async function uploadSchticks(content: string): Promise<AxiosResponse<void>> {
    return post(api.importSchticks(), { schtick: { yaml: content } })
  }

  async function removeSchtick(
    character: Character | string,
    schtick: Schtick | string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.characterSchticks(character, schtick))
  }

  async function duplicateSchtick(
    schtick: Schtick
  ): Promise<AxiosResponse<Schtick>> {
    return post(`${apiV2.schticks(schtick)}/duplicate`)
  }

  return {
    getSchticksBatch,
    getSchtickPaths,
    getSchtickCategories,
    getSchticks,
    getSchtick,
    createSchtick,
    updateSchtick,
    deleteSchtick,
    getCharacterSchticks,
    addSchtick,
    uploadSchticks,
    removeSchtick,
    duplicateSchtick,
  }
}
