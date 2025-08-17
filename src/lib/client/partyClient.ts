import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Party,
  PartiesResponse,
  CacheOptions,
  Parameters_,
  Fight,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createPartyClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, delete: delete_, requestFormData } = createBaseClient(deps)

  async function addCharacterToParty(
    party: Party | string,
    character: Character | string
  ): Promise<AxiosResponse<Party>> {
    return post(api.memberships(party), { character_id: character.id })
  }

  async function addVehicleToParty(
    party: Party | string,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Party>> {
    return post(api.memberships(party), { vehicle_id: vehicle.id })
  }

  async function removeCharacterFromParty(
    party: Party | string,
    character: Character | string
  ): Promise<AxiosResponse<Party>> {
    return delete_(`${api.memberships(party, character)}/character`)
  }

  async function removeVehicleFromParty(
    party: Party | string,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Party>> {
    return delete_(`${api.memberships(party, vehicle)}/vehicle`)
  }

  async function getParties(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<PartiesResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.parties()}?${query}`, {}, cacheOptions)
  }

  async function getParty(
    party: Party | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Party>> {
    return get(apiV2.parties(party), {}, cacheOptions)
  }

  async function deleteParty(
    party: Party | string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.parties(party))
  }

  async function createParty(
    formData: FormData
  ): Promise<AxiosResponse<Party>> {
    return requestFormData("POST", `${apiV2.parties()}`, formData)
  }

  async function updateParty(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Party>> {
    return requestFormData("PATCH", `${apiV2.parties({ id })}`, formData)
  }

  async function deletePartyImage(party: Party): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.parties(party)}/image`)
  }

  async function addPartyToFight(
    party: Party | string,
    fight: Fight | string
  ): Promise<AxiosResponse<Party>> {
    return post(api.addPartyToFight(party, fight))
  }

  return {
    addCharacterToParty,
    addVehicleToParty,
    removeCharacterFromParty,
    removeVehicleFromParty,
    getParties,
    getParty,
    deleteParty,
    createParty,
    updateParty,
    deletePartyImage,
    addPartyToFight,
  }
}
