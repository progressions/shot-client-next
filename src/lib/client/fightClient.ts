import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Fight,
  FightsResponse,
  FightEvent,
  CacheOptions,
  Parameters_,
  Encounter,
  Entity,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createFightClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
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

  async function getFights(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FightsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.fights()}?${query}`, {}, cacheOptions)
  }

  async function getFight(
    fight: Fight | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Fight>> {
    const response = await get<{ fight?: Fight }>(
      apiV2.fights(fight),
      {},
      cacheOptions
    )
    return normalizeFightResponse(response)
  }

  async function createFight(
    formData: FormData
  ): Promise<AxiosResponse<Fight>> {
    const response = await requestFormData<{ fight?: Fight }>(
      "POST",
      `${apiV2.fights()}`,
      formData
    )
    return normalizeFightResponse(response)
  }

  async function updateFight(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Fight>> {
    const response = await requestFormData<{ fight?: Fight }>(
      "PATCH",
      `${apiV2.fights({ id })}`,
      formData
    )
    return normalizeFightResponse(response)
  }

  async function touchFight(
    fight: Fight | string
  ): Promise<AxiosResponse<Fight>> {
    const response = await patch<{ fight?: Fight }>(
      `${apiV2.fights(fight)}/touch`
    )
    return normalizeFightResponse(response)
  }

  async function deleteFight(
    fight: Fight,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.fights(fight), params)
  }

  async function getFightEvents(
    fight: Fight | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FightEvent[]>> {
    const response = await get<{ fight_events: FightEvent[] }>(
      apiV2.fightEvents(fight),
      {},
      cacheOptions
    )
    // Normalize response to return array directly
    return {
      ...response,
      data: response.data?.fight_events ?? [],
    } as AxiosResponse<FightEvent[]>
  }

  async function createFightEvent(
    fight: Fight | string,
    fightEvent: FightEvent
  ): Promise<AxiosResponse<FightEvent>> {
    return post(apiV2.fightEvents(fight), { fight_event: fightEvent })
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

  async function applyBoostAction(
    fight: Fight | string,
    boosterId: string,
    targetId: string,
    boostType: "attack" | "defense",
    useFortune: boolean = false
  ): Promise<AxiosResponse<Encounter>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(`${apiV2.encounters()}/${fightId}/apply_combat_action`, {
      action_type: "boost",
      booster_id: boosterId,
      target_id: targetId,
      boost_type: boostType,
      use_fortune: useFortune,
    })
  }

  async function applyCombatAction(
    fight: Fight | string,
    characterUpdates: Array<{
      shot_id?: string
      character_id?: string
      vehicle_id?: string
      shot?: number
      wounds?: number
      count?: number
      impairments?: number
      defense?: number
      action_values?: Record<string, number>
      attributes?: Record<string, unknown>
      event?: {
        type: string
        description: string
        details?: Record<string, unknown>
      }
    }>
  ): Promise<AxiosResponse<Encounter>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(`${apiV2.encounters()}/${fightId}/apply_combat_action`, {
      character_updates: characterUpdates,
    })
  }

  async function applyUpCheck(
    fight: Fight | string,
    characterId: string,
    swerve: number,
    fortune: number = 0,
    success: boolean = false
  ): Promise<AxiosResponse<Encounter>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(`${apiV2.encounters()}/${fightId}/apply_combat_action`, {
      action_type: "up_check",
      character_id: characterId,
      swerve: swerve,
      fortune: fortune,
      success: success,
    })
  }

  async function applyChaseAction(
    fight: Fight | string,
    vehicleUpdates: Array<{
      vehicle_id: string
      target_vehicle_id?: string
      action_values?: Record<string, number | string>
      event?: {
        type: string
        description: string
        details?: Record<string, unknown>
      }
    }>
  ): Promise<AxiosResponse<Encounter>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(`${apiV2.encounters()}/${fightId}/apply_chase_action`, {
      vehicle_updates: vehicleUpdates,
    })
  }

  async function updateInitiatives(
    fight: Fight | string,
    shots: Array<{ id: string; shot: number }>
  ): Promise<AxiosResponse<Encounter>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return patch(`${apiV2.encounters()}/${fightId}/update_initiatives`, {
      shots,
    })
  }

  async function endFight(
    fight: Fight | string,
    notes?: string
  ): Promise<AxiosResponse<Fight>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    const response = await patch<{ fight?: Fight }>(
      `${apiV2.fights({ id: fightId })}/end_fight`,
      notes ? { notes } : {}
    )
    return normalizeFightResponse(response)
  }

  /**
   * Generate a magic link token for a character in an encounter.
   * This allows the character's owner to access the Player View without logging in.
   */
  async function generatePlayerViewToken(
    encounterId: string,
    characterId: string
  ): Promise<
    AxiosResponse<{
      id: string
      token: string
      url: string
      expires_at: string
      fight_id: string
      character_id: string
      user_id: string
    }>
  > {
    return post(apiV2.playerTokens(encounterId), { character_id: characterId })
  }

  /**
   * List valid (unexpired, unused) magic link tokens for an encounter.
   * Returns existing tokens that can be shared with players.
   */
  async function listPlayerViewTokens(encounterId: string): Promise<
    AxiosResponse<{
      tokens: Array<{
        id: string
        token: string
        url: string
        expires_at: string
        fight_id: string
        character_id: string
        user_id: string
      }>
    }>
  > {
    return get(apiV2.playerTokens(encounterId))
  }

  function normalizeFightResponse(
    response: AxiosResponse<{ fight?: Fight }>
  ): AxiosResponse<Fight> {
    const fightData =
      response.data?.fight ?? (response.data as unknown as Fight)
    ;(response as AxiosResponse<Fight>).data = fightData
    return response as AxiosResponse<Fight>
  }

  return {
    getEncounter,
    getFights,
    getFight,
    createFight,
    updateFight,
    touchFight,
    deleteFight,
    getFightEvents,
    createFightEvent,
    spendShots,
    applyBoostAction,
    applyCombatAction,
    applyUpCheck,
    applyChaseAction,
    updateInitiatives,
    endFight,
    generatePlayerViewToken,
    listPlayerViewTokens,
  }
}
