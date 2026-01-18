import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { SearchResponse } from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createSearchClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const { get } = createBaseClient(deps)

  async function search(query: string): Promise<AxiosResponse<SearchResponse>> {
    const params = queryParams({ q: query })
    const url = params ? `${apiV2.search()}?${params}` : apiV2.search()
    return get(url)
  }

  return {
    search,
  }
}
