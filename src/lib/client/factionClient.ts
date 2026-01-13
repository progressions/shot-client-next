import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Faction,
  FactionsResponse,
  CacheOptions,
  Parameters_,
  NotionPage,
  NotionSyncLogsResponse,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createFactionClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const { get, post, delete: delete_, requestFormData } = createBaseClient(deps)

  async function getFaction(
    faction: Faction | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Faction>> {
    return get(apiV2.factions(faction), {}, cacheOptions)
  }

  async function getFactions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FactionsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.factions()}?${query}`, {}, cacheOptions)
  }

  async function createFaction(
    formData: FormData
  ): Promise<AxiosResponse<Faction>> {
    return requestFormData("POST", `${apiV2.factions()}`, formData)
  }

  async function updateFaction(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Faction>> {
    return requestFormData("PATCH", `${apiV2.factions({ id })}`, formData)
  }

  async function deleteFactionImage(
    faction: Faction
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.factions(faction)}/image`)
  }

  async function deleteFaction(
    faction: Faction | string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.factions(faction))
  }

  async function duplicateFaction(
    faction: Faction
  ): Promise<AxiosResponse<Faction>> {
    return post(`${apiV2.factions(faction)}/duplicate`)
  }

  async function syncFactionToNotion(
    faction: Faction | string
  ): Promise<AxiosResponse<Faction>> {
    const factionId = typeof faction === "string" ? faction : faction.id
    return post(`${apiV2.factions({ id: factionId })}/sync`)
  }

  async function syncFactionFromNotion(
    faction: Faction | string
  ): Promise<AxiosResponse<Faction>> {
    const factionId = typeof faction === "string" ? faction : faction.id
    return post(apiV2.syncFactionFromNotion({ id: factionId }))
  }

  async function getNotionSyncLogsForFaction(
    faction: Faction | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionSyncLogsResponse>> {
    const factionId = typeof faction === "string" ? faction : faction.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.notionSyncLogsForFaction({ id: factionId })}?${query}`,
      {},
      cacheOptions
    )
  }

  async function pruneNotionSyncLogsForFaction(
    faction: Faction | string,
    daysOld: number = 30
  ): Promise<
    AxiosResponse<{ pruned_count: number; days_old: number; message: string }>
  > {
    const factionId = typeof faction === "string" ? faction : faction.id
    return delete_(
      `${apiV2.notionSyncLogsForFaction({ id: factionId })}/prune?days_old=${daysOld}`
    )
  }

  async function getNotionFactions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionFactions()}?${query}`, {}, cacheOptions)
  }

  return {
    getFaction,
    getFactions,
    createFaction,
    updateFaction,
    deleteFactionImage,
    deleteFaction,
    duplicateFaction,
    syncFactionToNotion,
    syncFactionFromNotion,
    getNotionSyncLogsForFaction,
    pruneNotionSyncLogsForFaction,
    getNotionFactions,
  }
}
