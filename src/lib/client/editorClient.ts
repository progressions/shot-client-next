import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { CacheOptions, Parameters_, SuggestionsResponse } from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createEditorClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const { get } = createBaseClient(deps)

  async function getSuggestions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SuggestionsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.suggestions()}?${query}`, {}, cacheOptions)
  }

  return {
    getSuggestions,
  }
}
