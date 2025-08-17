import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Site,
  SitesResponse,
  Juncture,
  JuncturesResponse,
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

export function createSiteClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, delete: delete_, requestFormData } = createBaseClient(deps)

  async function getSites(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SitesResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.sites()}?${query}`, {}, cacheOptions)
  }

  async function createSite(formData: FormData): Promise<AxiosResponse<Site>> {
    return requestFormData("POST", `${apiV2.sites()}`, formData)
  }

  async function updateSite(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Site>> {
    return requestFormData("PATCH", `${apiV2.sites({ id })}`, formData)
  }

  async function getSite(
    site: Site | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Site>> {
    return get(apiV2.sites(site), {}, cacheOptions)
  }

  async function deleteSite(site: Site): Promise<AxiosResponse<void>> {
    return delete_(apiV2.sites(site))
  }

  async function deleteSiteImage(site: Site): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.sites(site)}/image`)
  }

  async function addCharacterToSite(
    site: Site,
    character: Character
  ): Promise<AxiosResponse<Site>> {
    return post(api.sites(character), { site: site })
  }

  async function removeCharacterFromSite(
    site: Site,
    character: Character
  ): Promise<AxiosResponse<void>> {
    return delete_(api.sites(character, site))
  }

  async function getJunctures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<JuncturesResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.junctures()}?${query}`, {}, cacheOptions)
  }

  async function createJuncture(
    formData: FormData
  ): Promise<AxiosResponse<Juncture>> {
    return requestFormData("POST", `${apiV2.junctures()}`, formData)
  }

  async function updateJuncture(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Juncture>> {
    return requestFormData("PATCH", `${apiV2.junctures({ id })}`, formData)
  }

  async function getJuncture(
    juncture: Juncture | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Juncture>> {
    return get(apiV2.junctures(juncture), {}, cacheOptions)
  }

  async function deleteJuncture(
    juncture: Juncture
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.junctures(juncture))
  }

  async function deleteJunctureImage(
    juncture: Juncture
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.junctures(juncture)}/image`)
  }

  return {
    getSites,
    createSite,
    updateSite,
    getSite,
    deleteSite,
    deleteSiteImage,
    addCharacterToSite,
    removeCharacterFromSite,
    getJunctures,
    createJuncture,
    updateJuncture,
    getJuncture,
    deleteJuncture,
    deleteJunctureImage,
  }
}
