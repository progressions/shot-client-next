import axios, { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Character,
  Person,
  CharactersResponse,
  Location,
  Advancement,
  CacheOptions,
  Parameters_,
  Fight,
  Encounter,
  Entity,
  ImagePosition,
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

export function createCharacterClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const {
    get,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function getEncounter(
    fight?: Fight | string
  ): Promise<AxiosResponse<Encounter>> {
    return get(apiV2.encounters(fight), {}, { cache: "no-store" })
  }

  async function createImagePosition(
    entity: Entity,
    parameters: Parameters_ = {
      context: "desktop_index",
      x_position: 0,
      y_position: 0,
    }
  ): Promise<AxiosResponse<Entity>> {
    return post(apiV2.imagePositions(entity), { image_position: parameters })
  }

  async function updateImagePosition(
    entity: Entity,
    imagePosition: ImagePosition
  ): Promise<AxiosResponse<ImagePosition>> {
    return patch(
      `${apiV2.imagePositions()}/${entity.entity_class}/${entity.id}`,
      { image_position: imagePosition }
    )
  }

  async function getNotionCharacters(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionCharacters()}?${query}`, {}, cacheOptions)
  }

  async function getLocationForCharacter(
    character: Character,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Location>> {
    return get(
      api.locations(),
      { shot_id: character.shot_id } as Parameters_,
      cacheOptions
    )
  }

  async function setCharacterLocation(
    character: Character,
    location: Location | string
  ): Promise<AxiosResponse<Location>> {
    return post(api.locations(), {
      shot_id: character.shot_id,
      location: location,
    })
  }

  async function getCharacters(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CharactersResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.characters()}?${query}`, {}, cacheOptions)
  }

  async function getCharacterNames(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CharactersResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.characters()}/names?${query}`, {}, cacheOptions)
  }

  async function getCharactersInFight(
    fight: Fight | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Person[]>> {
    const query = queryParams(parameters)
    return get(
      `${api.charactersAndVehicles(fight)}/characters?${query}`,
      {},
      cacheOptions
    )
  }

  async function getCharacter(
    character: Character | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Person>> {
    return get(apiV2.characters(character), {}, cacheOptions)
  }

  async function getCharacterPdf(
    character: Character | string
  ): Promise<AxiosResponse<string>> {
    const url = `${apiV2.characterPdf(character)}`
    return await axios({
      url: url,
      method: "GET",
      params: {},
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deps.jwt}`,
      },
      proxy: false,
    })
  }

  async function updateCharacter(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Character>> {
    return requestFormData("PATCH", `${apiV2.characters({ id })}`, formData)
  }

  async function duplicateCharacter(
    character: Character
  ): Promise<AxiosResponse<Person>> {
    return post(`${apiV2.characters(character)}/duplicate`)
  }

  async function createCharacter(
    character: Character,
    fight?: Fight | null
  ): Promise<AxiosResponse<Person>> {
    // Use V2 API for character creation
    // The Phoenix backend handles campaign association via JWT context
    return post(apiV2.characters(), { character: character })
  }

  async function uploadCharacterPdf(
    formData: FormData
  ): Promise<AxiosResponse<Character>> {
    return requestFormData("POST", `${apiV2.characters()}/pdf`, formData)
  }

  async function deleteCharacter(
    character: Character,
    fight?: Fight | null,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return fight?.id
      ? delete_(
          api.characters(fight, { id: character.shot_id } as Character),
          params
        )
      : delete_(apiV2.characters(character), params)
  }

  async function deleteCharacterImage(
    character: Character
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.characters(character)}/image`)
  }

  /**
   * Deletes the image for any entity type using the entity's entity_class property.
   * Supports: Character (Person), Vehicle, Fight, Weapon, Schtick, Juncture, Site, Party, Faction, User.
   * Does NOT support: Campaign (will throw an error if called with a Campaign entity).
   */
  async function deleteEntityImage(
    entity: Entity
  ): Promise<AxiosResponse<Entity>> {
    const entityClass = entity.entity_class?.toLowerCase() || ""

    // Map entity class to API endpoint
    // Note: Characters have entity_class "Person" in this codebase
    const endpointMap: Record<string, string> = {
      person: `${apiV2.characters({ id: entity.id })}/image`,
      character: `${apiV2.characters({ id: entity.id })}/image`,
      vehicle: `${apiV2.vehicles({ id: entity.id })}/image`,
      fight: `${apiV2.fights({ id: entity.id })}/image`,
      weapon: `${apiV2.weapons({ id: entity.id })}/image`,
      schtick: `${apiV2.schticks({ id: entity.id })}/image`,
      juncture: `${apiV2.junctures({ id: entity.id })}/image`,
      site: `${apiV2.sites({ id: entity.id })}/image`,
      party: `${apiV2.parties({ id: entity.id })}/image`,
      faction: `${apiV2.factions({ id: entity.id })}/image`,
      user: `${apiV2.users({ id: entity.id })}/image`,
    }

    const endpoint = endpointMap[entityClass]
    if (!endpoint) {
      throw new Error(
        `Unsupported entity type for image deletion: ${entityClass}`
      )
    }

    return delete_(endpoint)
  }

  async function syncCharacter(
    character: Character
  ): Promise<AxiosResponse<Person>> {
    return post(`${api.characters(null, character)}/sync`)
  }

  async function createNotionPage(
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return post(apiV2.createNotionPage(character))
  }

  async function getNotionSyncLogs(
    character: Character | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionSyncLogsResponse>> {
    const characterId = typeof character === "string" ? character : character.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.notionSyncLogs({ id: characterId })}?${query}`,
      {},
      cacheOptions
    )
  }

  async function syncCharacterToNotion(
    character: Character | string
  ): Promise<AxiosResponse<{ status: string }>> {
    const characterId = typeof character === "string" ? character : character.id
    return post(`${apiV2.characters({ id: characterId })}/sync`)
  }

  async function syncCharacterFromNotion(
    character: Character | string
  ): Promise<AxiosResponse<Character>> {
    const characterId = typeof character === "string" ? character : character.id
    return post(`${apiV2.characters({ id: characterId })}/sync_from_notion`)
  }

  async function pruneNotionSyncLogs(
    character: Character | string,
    daysOld: number = 30
  ): Promise<
    AxiosResponse<{ pruned_count: number; days_old: number; message: string }>
  > {
    const characterId = typeof character === "string" ? character : character.id
    return delete_(
      `${apiV2.notionSyncLogs({ id: characterId })}/prune?days_old=${daysOld}`
    )
  }

  async function createCharacterFromNotion(
    notionPageId: string
  ): Promise<AxiosResponse<Character>> {
    return post(apiV2.createCharacterFromNotion(), {
      notion_page_id: notionPageId,
    })
  }

  async function spendShots(
    fight: Fight,
    entity: Entity,
    shots: number,
    actionId?: string
  ): Promise<AxiosResponse<Encounter>> {
    return patch(`${apiV2.encounters()}/${fight.id}/act`, {
      shot_id: entity.shot_id,
      shots: shots,
      action_id: actionId,
    })
  }

  async function hideCharacter(
    fight: Fight,
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return patch(api.hideCharacter(fight, { id: character.id } as Character), {
      character: { id: character.id, shot_id: character.shot_id } as Character,
    })
  }

  async function removeCharacterFromFight(
    fight: Fight | Encounter,
    character: Character
  ): Promise<AxiosResponse<void>> {
    // Use V2 API endpoint for removing character from fight
    return delete_(`${apiV2.fights(fight)}/shots/${character.shot_id}`)
  }

  async function showCharacter(
    fight: Fight,
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return patch(
      api.revealCharacter(fight, { id: character.id } as Character),
      {
        character: {
          id: character.id,
          shot_id: character.shot_id,
        } as Character,
      }
    )
  }

  async function addCharacter(
    fight: Fight,
    character: Character | string
  ): Promise<AxiosResponse<Character>> {
    // V2 API: Add character by updating fight's character_ids array
    const characterId = typeof character === "string" ? character : character.id
    const currentCharacterIds = fight.character_ids || []

    // Allow adding the same character multiple times (e.g., multiple mook groups)
    const updatedCharacterIds = [...currentCharacterIds, characterId]

    // Update the fight with new character_ids using v2 endpoint
    await patch(apiV2.fights(fight), {
      fight: {
        character_ids: updatedCharacterIds,
      },
    })

    // Return the character data with correct type
    if (typeof character === "string") {
      return getCharacter(characterId)
    }
    return { data: character } as AxiosResponse<Character>
  }

  async function getAdvancements(
    characterId: string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Advancement[]>> {
    return get(apiV2.advancements({ id: characterId }), {}, cacheOptions)
  }

  async function createAdvancement(
    characterId: string,
    data: { description: string }
  ): Promise<AxiosResponse<Advancement>> {
    return post(apiV2.advancements({ id: characterId }), {
      advancement: data,
    })
  }

  async function updateAdvancement(
    characterId: string,
    advancementId: string,
    data: { description: string }
  ): Promise<AxiosResponse<Advancement>> {
    return patch(apiV2.advancements({ id: characterId }, advancementId), {
      advancement: data,
    })
  }

  async function deleteAdvancement(
    characterId: string,
    advancementId: string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.advancements({ id: characterId }, advancementId))
  }

  async function getAllCharacters(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Character[]>> {
    return get(api.allCharacters(), {}, cacheOptions)
  }

  async function updateShotLocation(
    fight: Fight | Encounter,
    shotId: string,
    location: string
  ): Promise<AxiosResponse<void>> {
    return patch(`${apiV2.fights(fight)}/shots/${shotId}`, {
      shot: { location },
    })
  }

  async function updateCharacterCombatStats(
    characterId: string,
    updates: {
      name?: string
      impairments?: number
      action_values?: Record<string, unknown>
      status?: string[]
      driving_id?: string | null
    }
  ): Promise<AxiosResponse<Character>> {
    return patch(`${apiV2.characters({ id: characterId })}`, {
      character: updates,
    })
  }

  async function updateCharacterShot(
    fight: Fight | Encounter,
    character: Character,
    updates: {
      shot_id: string
      current_shot?: number | null
      impairments?: number
      count?: number
      driving_id?: string | null
      color?: string | null
    }
  ): Promise<AxiosResponse<void>> {
    // Use V2 API for shot updates
    return patch(`${apiV2.fights(fight)}/shots/${updates.shot_id}`, {
      shot: {
        shot: updates.current_shot,
        impairments: updates.impairments,
        count: updates.count,
        driving_id: updates.driving_id,
        color: updates.color,
      },
    })
  }

  return {
    getEncounter,
    createImagePosition,
    updateImagePosition,
    getNotionCharacters,
    getLocationForCharacter,
    setCharacterLocation,
    getCharacters,
    getCharacterNames,
    getCharactersInFight,
    getCharacter,
    getCharacterPdf,
    updateCharacter,
    duplicateCharacter,
    createCharacter,
    uploadCharacterPdf,
    deleteCharacter,
    deleteCharacterImage,
    deleteEntityImage,
    syncCharacter,
    createNotionPage,
    getNotionSyncLogs,
    pruneNotionSyncLogs,
    syncCharacterToNotion,
    syncCharacterFromNotion,
    createCharacterFromNotion,
    spendShots,
    hideCharacter,
    removeCharacterFromFight,
    showCharacter,
    addCharacter,
    getAdvancements,
    createAdvancement,
    updateAdvancement,
    deleteAdvancement,
    getAllCharacters,
    updateShotLocation,
    updateCharacterCombatStats,
    updateCharacterShot,
  }
}
