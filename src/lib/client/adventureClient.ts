import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Adventure,
  CacheOptions,
  Parameters_,
  Fight,
  Character,
  NotionPage,
  NotionSyncLogsResponse,
} from "@/types"

interface AdventuresResponse {
  adventures: Adventure[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
}

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createAdventureClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const {
    get,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function getAdventures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<AdventuresResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.adventures()}?${query}`, {}, cacheOptions)
  }

  async function getAdventure(
    adventure: Adventure | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Adventure>> {
    const id = typeof adventure === "string" ? adventure : adventure.id
    return get(apiV2.adventures({ id }), {}, cacheOptions)
  }

  async function deleteAdventure(
    adventure: Adventure | string
  ): Promise<AxiosResponse<void>> {
    const id = typeof adventure === "string" ? adventure : adventure.id
    return delete_(apiV2.adventures({ id }))
  }

  async function createAdventure(
    formData: FormData
  ): Promise<AxiosResponse<Adventure>> {
    return requestFormData("POST", `${apiV2.adventures()}`, formData)
  }

  async function updateAdventure(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Adventure>> {
    return requestFormData("PATCH", `${apiV2.adventures({ id })}`, formData)
  }

  async function deleteAdventureImage(
    adventure: Adventure
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.adventures(adventure)}/image`)
  }

  async function duplicateAdventure(
    adventure: Adventure
  ): Promise<AxiosResponse<Adventure>> {
    return post(`${apiV2.adventures(adventure)}/duplicate`)
  }

  // Character management (heroes)
  async function addCharacterToAdventure(
    adventure: Adventure | string,
    character: Character | string
  ): Promise<AxiosResponse<Adventure>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const characterId =
      typeof character === "string" ? character : character.id
    return post(apiV2.adventureCharacters({ id: adventureId }), {
      character_id: characterId,
    })
  }

  async function removeCharacterFromAdventure(
    adventure: Adventure | string,
    character: Character | string
  ): Promise<AxiosResponse<void>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const characterId =
      typeof character === "string" ? character : character.id
    return delete_(
      apiV2.adventureCharacters({ id: adventureId }, characterId)
    )
  }

  // Villain management
  async function addVillainToAdventure(
    adventure: Adventure | string,
    character: Character | string
  ): Promise<AxiosResponse<Adventure>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const characterId =
      typeof character === "string" ? character : character.id
    return post(apiV2.adventureVillains({ id: adventureId }), {
      character_id: characterId,
    })
  }

  async function removeVillainFromAdventure(
    adventure: Adventure | string,
    character: Character | string
  ): Promise<AxiosResponse<void>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const characterId =
      typeof character === "string" ? character : character.id
    return delete_(apiV2.adventureVillains({ id: adventureId }, characterId))
  }

  // Fight management
  async function addFightToAdventure(
    adventure: Adventure | string,
    fight: Fight | string
  ): Promise<AxiosResponse<Adventure>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(apiV2.adventureFights({ id: adventureId }), {
      fight_id: fightId,
    })
  }

  async function removeFightFromAdventure(
    adventure: Adventure | string,
    fight: Fight | string
  ): Promise<AxiosResponse<void>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const fightId = typeof fight === "string" ? fight : fight.id
    return delete_(apiV2.adventureFights({ id: adventureId }, fightId))
  }

  // Notion sync
  async function syncAdventureToNotion(
    adventure: Adventure | string
  ): Promise<AxiosResponse<Adventure>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    return post(`${apiV2.adventures({ id: adventureId })}/sync`)
  }

  async function syncAdventureFromNotion(
    adventure: Adventure | string
  ): Promise<AxiosResponse<Adventure>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    return post(apiV2.syncAdventureFromNotion({ id: adventureId }))
  }

  async function getNotionSyncLogsForAdventure(
    adventure: Adventure | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionSyncLogsResponse>> {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.notionSyncLogsForAdventure({ id: adventureId })}?${query}`,
      {},
      cacheOptions
    )
  }

  async function pruneNotionSyncLogsForAdventure(
    adventure: Adventure | string,
    daysOld: number = 30
  ): Promise<
    AxiosResponse<{ pruned_count: number; days_old: number; message: string }>
  > {
    const adventureId =
      typeof adventure === "string" ? adventure : adventure.id
    return delete_(
      `${apiV2.notionSyncLogsForAdventure({ id: adventureId })}/prune?days_old=${daysOld}`
    )
  }

  async function getNotionAdventures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionAdventures()}?${query}`, {}, cacheOptions)
  }

  return {
    getAdventures,
    getAdventure,
    deleteAdventure,
    createAdventure,
    updateAdventure,
    deleteAdventureImage,
    duplicateAdventure,
    // Character management
    addCharacterToAdventure,
    removeCharacterFromAdventure,
    // Villain management
    addVillainToAdventure,
    removeVillainFromAdventure,
    // Fight management
    addFightToAdventure,
    removeFightFromAdventure,
    // Notion sync
    syncAdventureToNotion,
    syncAdventureFromNotion,
    getNotionSyncLogsForAdventure,
    pruneNotionSyncLogsForAdventure,
    getNotionAdventures,
  }
}
