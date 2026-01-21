import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { Backlink, CacheOptions } from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
}

export function createBacklinkClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get } = createBaseClient(deps)

  async function getBacklinks(
    entityType: string,
    id: string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ backlinks: Backlink[] }>> {
    return get(apiV2.backlinks(entityType, id), {}, cacheOptions)
  }

  return { getBacklinks }
}
