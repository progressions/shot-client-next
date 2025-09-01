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
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createFightClient(deps: ClientDependencies) {
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
    return get(apiV2.fights(fight), {}, cacheOptions)
  }

  async function createFight(
    formData: FormData
  ): Promise<AxiosResponse<Fight>> {
    return requestFormData("POST", `${apiV2.fights()}`, formData)
  }

  async function updateFight(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Fight>> {
    return requestFormData("PATCH", `${apiV2.fights({ id })}`, formData)
  }

  async function touchFight(
    fight: Fight | string
  ): Promise<AxiosResponse<Fight>> {
    return patch(`${apiV2.fights(fight)}/touch`)
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
    return get(api.fightEvents(fight), {}, cacheOptions)
  }

  async function createFightEvent(
    fight: Fight | string,
    fightEvent: FightEvent
  ): Promise<AxiosResponse<FightEvent>> {
    return post(api.fightEvents(fight), { fight_event: fightEvent })
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
      attributes?: Record<string, any>
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
    applyCombatAction,
  }
}
