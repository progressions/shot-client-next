import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  CacheOptions,
  Parameters_,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createEditorClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  async function getSuggestions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SuggestionsResponse>> {
    const query = queryParams(parameters)
    return get(`${api.suggestions()}?${query}`, {}, cacheOptions)
  }
}
