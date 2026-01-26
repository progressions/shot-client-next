import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { LocationConnection, Fight } from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export interface LocationConnectionsResponse {
  location_connections: LocationConnection[]
}

export function createLocationConnectionClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, post, delete: delete_ } = createBaseClient(deps)

  /**
   * Get all location connections for a fight
   */
  async function getFightLocationConnections(
    fight: Fight | string
  ): Promise<AxiosResponse<LocationConnectionsResponse>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return get(apiV2.fightLocationConnections({ id: fightId }))
  }

  /**
   * Create a new location connection for a fight
   */
  async function createFightLocationConnection(
    fight: Fight | string,
    connection: {
      from_location_id: string
      to_location_id: string
      bidirectional?: boolean
      label?: string
    }
  ): Promise<AxiosResponse<LocationConnection>> {
    const fightId = typeof fight === "string" ? fight : fight.id
    return post(apiV2.fightLocationConnections({ id: fightId }), {
      location_connection: connection,
    })
  }

  /**
   * Delete a location connection
   */
  async function deleteLocationConnection(
    connection: LocationConnection | string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.locationConnections(connection))
  }

  return {
    getFightLocationConnections,
    createFightLocationConnection,
    deleteLocationConnection,
  }
}
