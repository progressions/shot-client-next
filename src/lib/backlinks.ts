"use client"

import type { Backlink } from "@/types"

export type FetchBacklinks = (
  entityType: string,
  id: string
) => Promise<Backlink[]>

// Create a stable backlinks fetcher using the shared API client.
export function createBacklinksFetcher(client: {
  getBacklinks: (
    entityType: string,
    id: string
  ) => Promise<{ data: { backlinks: Backlink[] } }>
}): FetchBacklinks {
  return async (entityType: string, id: string) => {
    const response = await client.getBacklinks(entityType, id)
    return response.data.backlinks || []
  }
}
