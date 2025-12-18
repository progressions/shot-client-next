import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Vehicle,
  Location,
  VehiclesResponse,
  VehicleArchetype,
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

export function createVehicleClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const {
    get,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function getLocationForVehicle(
    vehicle: Vehicle,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Location>> {
    return get(
      api.locations(),
      { shot_id: vehicle.shot_id } as Parameters_,
      cacheOptions
    )
  }

  async function setVehicleLocation(
    vehicle: Vehicle,
    location: Location | string
  ): Promise<AxiosResponse<Location>> {
    return post(api.locations(), {
      shot_id: vehicle.shot_id,
      location: location,
    })
  }

  async function getVehicles(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehiclesResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.vehicles()}?${query}`, {}, cacheOptions)
  }

  async function getVehiclesInFight(
    fight: Fight | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehiclesResponse>> {
    const query = queryParams(parameters)
    return get(
      `${api.charactersAndVehicles(fight)}/vehicles?${query}`,
      {},
      cacheOptions
    )
  }

  async function getVehicle(
    vehicle: Vehicle | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Vehicle>> {
    return get(apiV2.vehicles(vehicle), {}, cacheOptions)
  }

  async function getVehicleArchetypes(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehicleArchetype[]>> {
    return get(`${apiV2.vehicles()}/archetypes`, {}, cacheOptions)
  }

  async function createVehicle(
    formData: FormData
  ): Promise<AxiosResponse<Vehicle>> {
    return requestFormData("POST", `${apiV2.vehicles()}`, formData)
  }

  async function updateVehicle(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Vehicle>> {
    return requestFormData("PATCH", `${apiV2.vehicles({ id })}`, formData)
  }

  async function deleteVehicle(
    vehicle: Vehicle,
    fight?: Fight | null,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.vehicles(vehicle), params)
  }

  async function deleteVehicleImage(
    vehicle: Vehicle
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.vehicles(vehicle)}/image`)
  }

  async function actVehicle(
    vehicle: Vehicle,
    fight: Fight,
    shots: number
  ): Promise<AxiosResponse<Vehicle>> {
    return patch(api.actVehicle(fight, vehicle), {
      vehicle: { id: vehicle.id, shot_id: vehicle.shot_id } as Vehicle,
      shots: shots,
    })
  }

  async function addVehicle(
    fight: Fight,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Vehicle>> {
    // V2 API: Add vehicle by updating fight's vehicle_ids array
    const vehicleId = typeof vehicle === "string" ? vehicle : vehicle.id
    const currentVehicleIds = fight.vehicle_ids || []

    // Prevent duplicate entries
    if (currentVehicleIds.includes(vehicleId)) {
      // Vehicle already in fight, just return it
      if (typeof vehicle === "string") {
        return getVehicle(vehicleId)
      }
      return { data: vehicle } as AxiosResponse<Vehicle>
    }

    const updatedVehicleIds = [...currentVehicleIds, vehicleId]

    // Update the fight with new vehicle_ids using v2 endpoint
    await patch(apiV2.fights(fight), {
      fight: {
        vehicle_ids: updatedVehicleIds,
      },
    })

    // Return the vehicle data with correct type
    if (typeof vehicle === "string") {
      return getVehicle(vehicleId)
    }
    return { data: vehicle } as AxiosResponse<Vehicle>
  }

  async function hideVehicle(
    fight: Fight,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Vehicle>> {
    return patch(api.hideVehicle(fight, vehicle as Vehicle), {
      vehicle: vehicle,
    })
  }

  async function showVehicle(
    fight: Fight,
    vehicle: Vehicle | string
  ): Promise<AxiosResponse<Vehicle>> {
    return patch(api.revealVehicle(fight, vehicle as Vehicle), {
      vehicle: vehicle,
    })
  }

  async function getAllVehicles(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Vehicle[]>> {
    return get(api.allVehicles(), {}, cacheOptions)
  }

  async function removeVehicleFromFight(
    fight: Fight,
    vehicle: Vehicle
  ): Promise<AxiosResponse<void>> {
    // Use V2 API endpoint for removing vehicle from fight
    return delete_(`${apiV2.fights(fight)}/shots/${vehicle.shot_id}`)
  }

  async function updateVehicleCombatStats(
    vehicleId: string,
    updates: {
      name?: string
      action_values?: Record<string, unknown>
    }
  ): Promise<AxiosResponse<Vehicle>> {
    return patch(`${apiV2.vehicles({ id: vehicleId })}`, {
      vehicle: updates,
    })
  }

  async function updateVehicleShot(
    fight: Fight | import("@/types").Encounter,
    vehicle: Vehicle,
    updates: {
      shot_id: string
      current_shot?: number
      impairments?: number
      driver_id?: string | null
    }
  ): Promise<AxiosResponse<void>> {
    // Use V2 API for shot updates
    return patch(`${apiV2.fights(fight)}/shots/${updates.shot_id}`, {
      shot: {
        shot: updates.current_shot,
        impairments: updates.impairments,
        driver_id: updates.driver_id,
      },
    })
  }

  async function updateShotLocation(
    fight: Fight | import("@/types").Encounter,
    shotId: string,
    location: string
  ): Promise<AxiosResponse<void>> {
    return patch(`${apiV2.fights(fight)}/shots/${shotId}`, {
      shot: {
        location: location,
      },
    })
  }

  async function duplicateVehicle(
    vehicle: Vehicle
  ): Promise<AxiosResponse<Vehicle>> {
    return post(`${apiV2.vehicles(vehicle)}/duplicate`)
  }

  return {
    getLocationForVehicle,
    setVehicleLocation,
    getVehicles,
    getVehiclesInFight,
    getVehicle,
    getVehicleArchetypes,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    deleteVehicleImage,
    duplicateVehicle,
    actVehicle,
    addVehicle,
    hideVehicle,
    showVehicle,
    getAllVehicles,
    removeVehicleFromFight,
    updateVehicleCombatStats,
    updateVehicleShot,
    updateShotLocation,
  }
}
