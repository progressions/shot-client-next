import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  ChaseRelationship,
  CacheOptions,
  Parameters_,
  Vehicle,
  Fight,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

interface ChaseRelationshipsResponse {
  chase_relationships: ChaseRelationship[]
  meta?: {
    total: number
    page: number
    per_page: number
  }
}

interface ChaseRelationshipResponse {
  chase_relationship: ChaseRelationship
}

interface ChaseRelationshipParams {
  pursuer_id: string
  evader_id: string
  fight_id: string
  position?: "near" | "far"
  active?: boolean
}

export function createChaseRelationshipClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  async function getChaseRelationships(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<ChaseRelationshipsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.chaseRelationships()}?${query}`, {}, cacheOptions)
  }

  async function getChaseRelationshipsForFight(
    fight: Fight | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<ChaseRelationshipsResponse>> {
    const fight_id = typeof fight === "string" ? fight : fight.id
    return getChaseRelationships({ fight_id }, cacheOptions)
  }

  async function getChaseRelationshipsForVehicle(
    vehicle: Vehicle | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<ChaseRelationshipsResponse>> {
    const vehicle_id = typeof vehicle === "string" ? vehicle : vehicle.id
    return getChaseRelationships({ vehicle_id }, cacheOptions)
  }

  async function getChaseRelationship(
    id: string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<ChaseRelationshipResponse>> {
    return get(apiV2.chaseRelationship(id), {}, cacheOptions)
  }

  async function createChaseRelationship(
    params: ChaseRelationshipParams
  ): Promise<AxiosResponse<ChaseRelationshipResponse>> {
    return post(apiV2.chaseRelationships(), {
      chase_relationship: params,
    })
  }

  async function updateChaseRelationship(
    id: string,
    params: Partial<Pick<ChaseRelationshipParams, "position" | "active">>
  ): Promise<AxiosResponse<ChaseRelationshipResponse>> {
    return patch(apiV2.chaseRelationship(id), {
      chase_relationship: params,
    })
  }

  async function updateChasePosition(
    id: string,
    position: "near" | "far"
  ): Promise<AxiosResponse<ChaseRelationshipResponse>> {
    return updateChaseRelationship(id, { position })
  }

  async function deleteChaseRelationship(
    id: string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.chaseRelationship(id))
  }

  async function deactivateChaseRelationship(
    id: string
  ): Promise<AxiosResponse<ChaseRelationshipResponse>> {
    return updateChaseRelationship(id, { active: false })
  }

  return {
    getChaseRelationships,
    getChaseRelationshipsForFight,
    getChaseRelationshipsForVehicle,
    getChaseRelationship,
    createChaseRelationship,
    updateChaseRelationship,
    updateChasePosition,
    deleteChaseRelationship,
    deactivateChaseRelationship,
  }
}
