import type { AxiosResponse } from "axios"
import type { CharacterEffect, Encounter } from "@/types"
import { createBaseClient } from "./baseClient"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createCharacterEffectClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  async function createCharacterEffect(
    encounter: Encounter,
    effect: Partial<CharacterEffect>
  ): Promise<AxiosResponse<CharacterEffect>> {
    return post(`${api.fights(encounter)}/character_effects`, {
      character_effect: effect
    })
  }

  async function updateCharacterEffect(
    encounter: Encounter,
    effect: CharacterEffect
  ): Promise<AxiosResponse<CharacterEffect>> {
    return patch(`${api.fights(encounter)}/character_effects/${effect.id}`, {
      character_effect: effect
    })
  }

  async function deleteCharacterEffect(
    encounter: Encounter,
    effect: CharacterEffect
  ): Promise<AxiosResponse<void>> {
    return delete_(`${api.fights(encounter)}/character_effects/${effect.id}`)
  }

  async function getCharacterEffects(
    encounter: Encounter
  ): Promise<AxiosResponse<CharacterEffect[]>> {
    return get(`${api.fights(encounter)}/character_effects`)
  }

  return {
    createCharacterEffect,
    updateCharacterEffect,
    deleteCharacterEffect,
    getCharacterEffects
  }
}