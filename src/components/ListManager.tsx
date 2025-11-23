"use client"
import { Skeleton, Stack, Box } from "@mui/material"
import { GenericFilter, BadgeList } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState } from "react"
import { paginateArray } from "@/lib"
import { filterConfigs } from "@/lib/filterConfigs"
import type { Fight } from "@/types"
import pluralize from "pluralize"
import {
  useChildIds,
  useChildEntities,
  useOptimisticManager,
  useAutocompleteFilters,
} from "./ListManager/hooks"

type ListManagerProps = {
  open: boolean
  parentEntity: Fight
  childEntityName: keyof typeof filterConfigs
  onListUpdate?: (updatedEntity: Fight) => Promise<void>
  excludeIds?: number[]
  manage?: boolean
}

export function ListManager({
  open,
  parentEntity,
  childEntityName,
  onListUpdate,
  excludeIds = [],
  manage = true,
}: ListManagerProps) {
  const { client } = useClient()
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Data Derivation
  const { childIds, childIdsKey } = useChildIds(parentEntity, childEntityName)

  // 2. Data Fetching & State
  const { childEntities, setChildEntities, optimisticUpdateRef, collection } =
    useChildEntities(childEntityName, childIds, parentEntity, client)

  // 3. Interaction Handlers
  const { handleAdd, handleDelete } = useOptimisticManager({
    childEntities,
    setChildEntities,
    optimisticUpdateRef,
    childIds,
    onListUpdate,
    parentEntity,
    childIdsKey,
    childEntityName,
    setCurrentPage,
  })

  // 4. Filter Logic
  const { formState, updateFilters, loading } = useAutocompleteFilters(
    pluralize(childEntityName),
    client
  )

  // 5. Pagination (Presentational)
  const { items: paginatedItems, meta } = paginateArray(
    childEntities.sort((a, b) => {
      const nameA = a.name || ""
      const nameB = b.name || ""
      return nameA.localeCompare(nameB)
    }),
    currentPage,
    5
  )

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {manage && open && (
        <GenericFilter
          entity={childEntityName}
          formState={formState}
          omit={["search"]}
          onFiltersUpdate={updateFilters}
          onChange={handleAdd}
          excludeIds={excludeIds}
        />
      )}
      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Stack>
      ) : (
        <BadgeList
          items={paginatedItems}
          open={open}
          collection={collection}
          meta={meta}
          handleDelete={handleDelete}
          handlePageChange={handlePageChange}
        />
      )}
    </Box>
  )
}
