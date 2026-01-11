import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Party,
  PartiesResponse,
  CacheOptions,
  Parameters_,
  Fight,
  Character,
  Vehicle,
  PartyTemplate,
  PartyRole,
  NotionPage,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createPartyClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const {
    get,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function addCharacterToParty(
    party: Party | string,
    character: Character | string
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    const characterId = typeof character === "string" ? character : character.id
    return post(apiV2.partyMembers({ id: partyId }), {
      character_id: characterId,
    })
  }

  async function addVehicleToParty(
    party: Party | string,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    const vehicleId = typeof vehicle === "string" ? vehicle : vehicle.id
    return post(apiV2.partyMembers({ id: partyId }), { vehicle_id: vehicleId })
  }

  async function removeCharacterFromParty(
    party: Party | string,
    membershipId: string
  ): Promise<AxiosResponse<void>> {
    const partyId = typeof party === "string" ? party : party.id
    return delete_(apiV2.partyMembers({ id: partyId }, membershipId))
  }

  async function removeVehicleFromParty(
    party: Party | string,
    membershipId: string
  ): Promise<AxiosResponse<void>> {
    const partyId = typeof party === "string" ? party : party.id
    return delete_(apiV2.partyMembers({ id: partyId }, membershipId))
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

  async function duplicateParty(party: Party): Promise<AxiosResponse<Party>> {
    return post(`${apiV2.parties(party)}/duplicate`)
  }

  async function syncPartyToNotion(
    party: Party | string
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    return post(`${apiV2.parties({ id: partyId })}/sync`)
  }

  async function getNotionParties(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return get(`${apiV2.notionParties()}?${query}`, {}, cacheOptions)
  }

  async function addPartyToFight(
    party: Party | string,
    fight: Fight | string
  ): Promise<AxiosResponse<Party>> {
    return post(api.addPartyToFight(party, fight))
  }

  // Party Composition / Slot Management Functions

  async function getTemplates(): Promise<
    AxiosResponse<{ templates: PartyTemplate[] }>
  > {
    return get(apiV2.partyTemplates())
  }

  async function applyTemplate(
    party: Party | string,
    templateKey: string
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    return post(apiV2.partyApplyTemplate({ id: partyId }), {
      template_key: templateKey,
    })
  }

  async function addSlot(
    party: Party | string,
    slot: {
      role: PartyRole
      character_id?: string | null
      vehicle_id?: string | null
      default_mook_count?: number | null
    }
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    return post(apiV2.partySlots({ id: partyId }), slot)
  }

  async function updateSlot(
    party: Party | string,
    slotId: string,
    attrs: {
      role?: PartyRole
      character_id?: string | null
      vehicle_id?: string | null
      default_mook_count?: number | null
    }
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    return patch(apiV2.partySlots({ id: partyId }, slotId), attrs)
  }

  async function removeSlot(
    party: Party | string,
    slotId: string
  ): Promise<AxiosResponse<void>> {
    const partyId = typeof party === "string" ? party : party.id
    return delete_(apiV2.partySlots({ id: partyId }, slotId))
  }

  async function reorderSlots(
    party: Party | string,
    slotIds: string[]
  ): Promise<AxiosResponse<Party>> {
    const partyId = typeof party === "string" ? party : party.id
    return post(apiV2.partyReorderSlots({ id: partyId }), {
      slot_ids: slotIds,
    })
  }

  async function populateSlot(
    party: Party | string,
    slotId: string,
    characterId: string
  ): Promise<AxiosResponse<Party>> {
    return updateSlot(party, slotId, { character_id: characterId })
  }

  async function clearSlot(
    party: Party | string,
    slotId: string
  ): Promise<AxiosResponse<Party>> {
    return updateSlot(party, slotId, { character_id: null, vehicle_id: null })
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
    duplicateParty,
    syncPartyToNotion,
    getNotionParties,
    addPartyToFight,
    // Party Composition / Slot Management
    getTemplates,
    applyTemplate,
    addSlot,
    updateSlot,
    removeSlot,
    reorderSlots,
    populateSlot,
    clearSlot,
  }
}
