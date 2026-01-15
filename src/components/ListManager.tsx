"use client"

/**
 * ListManager Component
 *
 * Manages parent-child entity relationships with optimistic updates.
 * Provides a unified interface for adding/removing child entities from a parent
 * (e.g., adding Characters or Vehicles to a Fight).
 *
 * Features:
 * - Optimistic UI updates with automatic rollback on error
 * - Filterable autocomplete for adding new entities
 * - Paginated badge list display
 * - Support for Characters and Vehicles derived from shots
 *
 * @module components/ListManager
 */

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

/**
 * Props for the ListManager component.
 *
 * @property open - Whether the manager UI is expanded/visible
 * @property parentEntity - The parent Fight entity containing child relationships
 * @property childEntityName - Type of child entity to manage (e.g., "Character", "Vehicle")
 * @property onListUpdate - Callback fired when the child list is modified
 * @property excludeIds - IDs to exclude from the autocomplete options (defaults to [])
 * @property manage - Whether to show add/remove controls (defaults to true)
 * @property allowDuplicates - Allow adding the same entity multiple times (defaults to false)
 */
type ListManagerProps = {
  open: boolean
  parentEntity: Fight
  childEntityName: keyof typeof filterConfigs
  onListUpdate?: (updatedEntity: Fight) => Promise<void>
  excludeIds?: string[]
  manage?: boolean
  allowDuplicates?: boolean
  relationship?: string // Override for the relationship key (e.g., "villains" instead of "characters")
}

/**
 * Component for managing parent-child entity relationships with optimistic updates.
 *
 * Combines filtering, autocomplete selection, and paginated display to provide
 * a complete interface for managing entity relationships. Uses optimistic updates
 * for responsive UI with automatic rollback on server errors.
 *
 * @param props - Component props
 * @returns Rendered list manager with filter and badge list
 *
 * @example
 * ```tsx
 * <ListManager
 *   open={isExpanded}
 *   parentEntity={fight}
 *   childEntityName="Character"
 *   onListUpdate={handleFightUpdate}
 *   excludeIds={alreadySelectedIds}
 * />
 * ```
 */
export function ListManager({
  open,
  parentEntity,
  childEntityName,
  onListUpdate,
  excludeIds = [],
  manage = true,
  allowDuplicates = false,
  relationship,
}: ListManagerProps) {
  const { client } = useClient()
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Data Derivation
  const { childIds, childIdsKey } = useChildIds(
    parentEntity,
    childEntityName,
    relationship
  )

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
    allowDuplicates,
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
