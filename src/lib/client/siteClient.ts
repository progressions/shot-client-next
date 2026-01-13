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
  NotionPage,
  NotionSyncLog,
} from "@/types"

interface NotionSyncLogsResponse {
  notion_sync_logs: NotionSyncLog[]
  meta: {
    current_page: number
    per_page: number
    total_count: number
    total_pages: number
  }
}

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

  async function duplicateSite(site: Site): Promise<AxiosResponse<Site>> {
    return post(`${apiV2.sites(site)}/duplicate`)
  }

  async function syncSiteToNotion(
    site: Site | string
  ): Promise<AxiosResponse<Site>> {
    const siteId = typeof site === "string" ? site : site.id
    return post(`${apiV2.sites({ id: siteId })}/sync`)
  }

  async function syncSiteFromNotion(
    site: Site | string
  ): Promise<AxiosResponse<Site>> {
    const siteId = typeof site === "string" ? site : site.id
    return post(apiV2.syncSiteFromNotion({ id: siteId }))
  }

  async function getNotionSyncLogsForSite(
    site: Site | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionSyncLogsResponse>> {
    const siteId = typeof site === "string" ? site : site.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.notionSyncLogsForSite({ id: siteId })}?${query}`,
      {},
      cacheOptions
    )
  }

  async function pruneNotionSyncLogsForSite(
    site: Site | string,
    daysOld: number = 30
  ): Promise<
    AxiosResponse<{ pruned_count: number; days_old: number; message: string }>
  > {
    const siteId = typeof site === "string" ? site : site.id
    return delete_(
      `${apiV2.notionSyncLogsForSite({ id: siteId })}/prune?days_old=${daysOld}`
    )
  }

  async function getNotionSites(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionSites()}?${query}`, {}, cacheOptions)
  }

  async function getNotionJunctures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionJunctures()}?${query}`, {}, cacheOptions)
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

  async function syncJunctureToNotion(
    juncture: Juncture | string
  ): Promise<AxiosResponse<Juncture>> {
    const junctureId = typeof juncture === "string" ? juncture : juncture.id
    return post(`${apiV2.junctures({ id: junctureId })}/sync`)
  }

  async function syncJunctureFromNotion(
    juncture: Juncture | string
  ): Promise<AxiosResponse<Juncture>> {
    const junctureId = typeof juncture === "string" ? juncture : juncture.id
    return post(apiV2.syncJunctureFromNotion({ id: junctureId }))
  }

  async function getNotionSyncLogsForJuncture(
    juncture: Juncture | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionSyncLogsResponse>> {
    const junctureId = typeof juncture === "string" ? juncture : juncture.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.notionSyncLogsForJuncture({ id: junctureId })}?${query}`,
      {},
      cacheOptions
    )
  }

  async function pruneNotionSyncLogsForJuncture(
    juncture: Juncture | string,
    daysOld: number = 30
  ): Promise<
    AxiosResponse<{ pruned_count: number; days_old: number; message: string }>
  > {
    const junctureId = typeof juncture === "string" ? juncture : juncture.id
    return delete_(
      `${apiV2.notionSyncLogsForJuncture({ id: junctureId })}/prune?days_old=${daysOld}`
    )
  }

  return {
    getSites,
    createSite,
    updateSite,
    getSite,
    deleteSite,
    deleteSiteImage,
    duplicateSite,
    syncSiteToNotion,
    syncSiteFromNotion,
    getNotionSyncLogsForSite,
    pruneNotionSyncLogsForSite,
    getNotionSites,
    getNotionJunctures,
    addCharacterToSite,
    removeCharacterFromSite,
    getJunctures,
    createJuncture,
    updateJuncture,
    getJuncture,
    deleteJuncture,
    deleteJunctureImage,
    syncJunctureToNotion,
    syncJunctureFromNotion,
    getNotionSyncLogsForJuncture,
    pruneNotionSyncLogsForJuncture,
  }
}
