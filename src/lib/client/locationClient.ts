import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Location,
  LocationsResponse,
  CacheOptions,
  Parameters_,
  Fight,
  Site,
  SetLocationResponse,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createLocationClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  /**
   * Get locations for a specific fight
   */
  async function getFightLocations(
    fight: Fight | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<LocationsResponse>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.fightLocations({ id: fightId })}?${query}`,
      {},
      cacheOptions
    )
  }

  /**
   * Get locations for a specific site (template locations)
   */
  async function getSiteLocations(
    site: Site | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<LocationsResponse>> {
    const siteId = typeof site === "string" ? site : site.id
    const query = queryParams(parameters)
    return get(
      `${apiV2.siteLocations({ id: siteId })}?${query}`,
      {},
      cacheOptions
    )
  }

  /**
   * Get a single location by ID
   */
  async function getLocation(
    location: Location | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Location>> {
    return get(apiV2.locations(location), {}, cacheOptions)
  }

  /**
   * Create a location for a fight
   */
  async function createFightLocation(
    fight: Fight | string,
    location: Partial<Location>
  ): Promise<AxiosResponse<Location>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(apiV2.fightLocations({ id: fightId }), { location })
  }

  /**
   * Create a location for a site (template location)
   */
  async function createSiteLocation(
    site: Site | string,
    location: Partial<Location>
  ): Promise<AxiosResponse<Location>> {
    const siteId = typeof site === "string" ? site : site.id
    return post(apiV2.siteLocations({ id: siteId }), { location })
  }

  /**
   * Update a location
   */
  async function updateLocation(
    location: Location | string,
    updates: Partial<Location>
  ): Promise<AxiosResponse<Location>> {
    const locationId = typeof location === "string" ? location : location.id
    return patch(apiV2.locations({ id: locationId }), { location: updates })
  }

  /**
   * Delete a location
   */
  async function deleteLocation(
    location: Location | string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.locations(location))
  }

  /**
   * Quick-set location for a shot.
   * Creates location if it doesn't exist, reuses existing location (case-insensitive).
   * Pass null or empty string to clear the location.
   */
  async function setShotLocation(
    shotId: string,
    locationName: string | null
  ): Promise<AxiosResponse<SetLocationResponse>> {
    return post(apiV2.setShotLocation(shotId), { location_name: locationName })
  }

  return {
    getFightLocations,
    getSiteLocations,
    getLocation,
    createFightLocation,
    createSiteLocation,
    updateLocation,
    deleteLocation,
    setShotLocation,
  }
}
