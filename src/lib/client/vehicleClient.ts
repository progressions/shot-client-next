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
    fight?: Fight | null
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.vehicles(vehicle))
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
    return post(api.addVehicle(fight, vehicle), {
      vehicle: { current_shot: 0 },
    })
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
    actVehicle,
    addVehicle,
    hideVehicle,
    showVehicle,
    getAllVehicles,
  }
}
