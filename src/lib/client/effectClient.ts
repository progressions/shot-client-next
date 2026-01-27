import type { AxiosResponse } from "axios"
import type { Effect, Encounter } from "@/types"
import { createBaseClient } from "./baseClient"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createEffectClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  async function getEffects(
    encounter: Encounter
  ): Promise<AxiosResponse<{ effects: Effect[] }>> {
    return get(`${apiV2.fights(encounter)}/effects`)
  }

  async function createEffect(
    encounter: Encounter,
    effect: Partial<Effect>
  ): Promise<AxiosResponse<Effect>> {
    return post(`${apiV2.fights(encounter)}/effects`, {
      effect: effect,
    })
  }

  async function updateEffect(
    encounter: Encounter,
    effect: Effect
  ): Promise<AxiosResponse<Effect>> {
    return patch(`${apiV2.fights(encounter)}/effects/${effect.id}`, {
      effect: effect,
    })
  }

  async function deleteEffect(
    encounter: Encounter,
    effect: Effect
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.fights(encounter)}/effects/${effect.id}`)
  }

  return {
    getEffects,
    createEffect,
    updateEffect,
    deleteEffect,
  }
}
