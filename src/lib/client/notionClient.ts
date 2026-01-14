import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { CacheOptions } from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createNotionClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get } = createBaseClient(deps)

  async function getNotionDatabases(
    campaignId: string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Array<{ id: string; title: string | null }>>> {
    return get(
      `${apiV2.notion()}/databases?campaign_id=${campaignId}`,
      {},
      cacheOptions
    )
  }

  return {
    getNotionDatabases,
  }
}
