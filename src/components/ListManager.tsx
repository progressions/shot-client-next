"use client"
import { Skeleton, Stack, Box } from "@mui/material"
import { GenericFilter, BadgeList } from "@/components/ui"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { paginateArray } from "@/lib"
import { filterConfigs } from "@/lib/filterConfigs"
import type { Fight } from "@/types"
import pluralize from "pluralize"
import { collectionNames } from "@/lib/maps"

interface AutocompleteOption {
  id: number
  name: string
}

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
  const childIdsKey = `${childEntityName.toLowerCase()}_ids`
  const childIds = useMemo(() => {
    if (childEntityName === "Character" && Array.isArray(parentEntity.shots)) {
      const idsFromShots = parentEntity.shots
        .map(shot => shot.character_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }
    if (childEntityName === "Vehicle" && Array.isArray(parentEntity.shots)) {
      const idsFromShots = parentEntity.shots
        .map(shot => shot.vehicle_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }

    const ids = parentEntity[childIdsKey]
    if (Array.isArray(ids) && ids.length > 0) {
      return ids
    }
    return []
  }, [childEntityName, childIdsKey, parentEntity])
  const stableExcludeIds = excludeIds
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)
  const defaultEntities = useMemo(() => {
    if (
      Array.isArray(parentEntity[collection]) &&
      parentEntity[collection].length
    ) {
      return parentEntity[collection]
    }
    if (childEntityName === "Character" && Array.isArray(parentEntity.shots)) {
      return parentEntity.shots
        .map(shot => shot.character)
        .filter(Boolean)
        .map(character => ({
          ...character,
          entity_class: character.entity_class || "Character",
        }))
    }
    if (childEntityName === "Vehicle" && Array.isArray(parentEntity.shots)) {
      return parentEntity.shots
        .map(shot => shot.vehicle)
        .filter(Boolean)
        .map(vehicle => ({
          ...vehicle,
          entity_class: vehicle.entity_class || "Vehicle",
        }))
    }
    return []
  }, [childEntityName, collection, parentEntity])

  const [childEntities, setChildEntities] = useState(defaultEntities)
  const lastFetchedIdsRef = useRef<(number | string)[]>([])
  const { client } = useClient()
  // Don't use fight_id filter for autocomplete - we want to show ALL characters
  // for selection, not just ones already in the fight
  const contextualFilters: Record<string, string> = useMemo(() => ({}), [])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const { items: paginatedItems, meta } = paginateArray(
    childEntities.sort((a, b) => {
      const nameA = a.name || ""
      const nameB = b.name || ""
      return nameA.localeCompare(nameB)
    }),
    currentPage,
    5
  )
  const { formState, dispatchForm } = useForm<{
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }>({
    characters: [],
    factions: [],
    archetypes: [],
    types: [],
    filters: {
      ...contextualFilters,
      per_page: 200,
      sort: "name",
      order: "asc",
    },
  })
  const { filters } = formState.data
  // console.log("parentEntity", parentEntity)
  // console.log("childIds", childEntityName, childIds)

  useEffect(() => {
    const fetchChildEntities = async () => {
      console.log("🔍 useEffect triggered - childIds:", childIds)
      console.log("🔍 lastFetchedIds:", lastFetchedIdsRef.current)

      if (!childIds || childIds.length === 0) {
        console.log("🔍 No childIds, clearing entities")
        setChildEntities([])
        lastFetchedIdsRef.current = []
        return
      }

      // Check if we already have these exact IDs - skip fetch if so
      const sortedChildIds = [...childIds].sort().join(",")
      const sortedLastFetched = [...lastFetchedIdsRef.current].sort().join(",")

      console.log("🔍 Comparing IDs:")
      console.log("   childIds:", sortedChildIds)
      console.log("   lastFetched:", sortedLastFetched)

      if (sortedChildIds === sortedLastFetched) {
        console.log("✅ Skipping fetch - IDs match exactly")
        return
      }

      // If incoming childIds are a subset of what we have (i.e., stale broadcast),
      // skip the fetch to preserve our optimistic update
      const childIdsSet = new Set(childIds)
      const lastFetchedSet = new Set(lastFetchedIdsRef.current)
      const isSubset = [...childIdsSet].every(id => lastFetchedSet.has(id))

      if (isSubset && childIds.length < lastFetchedIdsRef.current.length) {
        console.log(
          "⚠️ Skipping fetch - incoming IDs are a subset (stale broadcast)"
        )
        console.log("   Incoming:", childIds.length, "IDs")
        console.log("   Current:", lastFetchedIdsRef.current.length, "IDs")
        return
      }

      console.log("📡 IDs don't match - fetching from server")

      try {
        const funcName = `get${pluralChildEntityName}`
        const getFunc = client[funcName as keyof typeof client]

        if (typeof getFunc !== "function") {
          console.error(`Function ${funcName} does not exist on client`)
          return
        }

        const response = await (
          getFunc as (
            params: Record<string, unknown>,
            cache?: Record<string, unknown>
          ) => Promise<{ data: Record<string, unknown> }>
        )({
          sort: "name",
          order: "asc",
          ids: childIds,
          per_page: 200,
        })

        console.log(
          "📡 Fetch complete, setting entities:",
          response.data[collection]
        )
        setChildEntities(response.data[collection] || [])
        lastFetchedIdsRef.current = childIds
      } catch (error) {
        console.error(`Fetch ${childEntityName} error:`, error)
      }
    }
    fetchChildEntities()
  }, [
    dispatchForm,
    childIds,
    childEntityName,
    client,
    collection,
    pluralChildEntityName,
  ])

  useEffect(() => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: {
        ...contextualFilters,
        sort: "name",
        order: "asc",
        per_page: 200,
      },
    })
  }, [contextualFilters, dispatchForm])

  const fetchChildrenForAutocomplete = useCallback(
    async (localFilters: Record<string, string | boolean | null>) => {
      try {
        const funcName = `get${pluralChildEntityName}`
        const getFunc = client[funcName as keyof typeof client]

        if (typeof getFunc !== "function") {
          console.error(`Function ${funcName} does not exist on client`)
          return
        }

        const response = await (
          getFunc as (
            params: Record<string, unknown>,
            cache?: Record<string, unknown>
          ) => Promise<{ data: Record<string, unknown> }>
        )({ ...contextualFilters, ...localFilters })
        for (const [key, value] of Object.entries(response.data)) {
          dispatchForm({
            type: FormActions.UPDATE,
            name: key,
            value: value,
          })
        }
      } catch (error) {
        console.error("Fetch children error:", error)
      }
      setLoading(false)
    },
    [client, contextualFilters, dispatchForm, pluralChildEntityName]
  )

  useEffect(() => {
    fetchChildrenForAutocomplete(filters)
  }, [filters, fetchChildrenForAutocomplete])

  const updateFilters = useCallback(
    (filters: Record<string, string | boolean | null>) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: {
          ...contextualFilters,
          ...formState.data.filters,
          ...filters,
        },
      })
    },
    [contextualFilters, dispatchForm, formState.data.filters]
  )

  const handleAdd = useCallback(
    async (child: AutocompleteOption | string | null) => {
      if (
        child &&
        typeof child !== "string" &&
        !(childIds as (number | string)[]).includes(child.id)
      ) {
        console.log("➕ Adding child:", child.name, child.id)
        // Locally update childEntities immediately
        const updatedEntities = [...childEntities, child]
        setChildEntities(updatedEntities)
        // Use the updated entities list to build the new IDs array
        const newChildIds = updatedEntities.map(entity => entity.id)

        console.log("➕ Updated local entities, new IDs:", newChildIds)
        // Update lastFetchedIds immediately to prevent broadcasts from overwriting
        lastFetchedIdsRef.current = newChildIds

        try {
          console.log("➕ Calling onListUpdate...")
          await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
          console.log("➕ onListUpdate complete")
          setCurrentPage(1)
        } catch (error) {
          console.error(
            `Failed to add ${childEntityName.toLowerCase()}:`,
            error
          )
          // Revert local update on error
          setChildEntities(prev =>
            prev.filter(entity => entity.id !== child.id)
          )
          // Revert lastFetchedIds
          lastFetchedIdsRef.current = childIds
        }
      }
    },
    [
      childIds,
      childEntities,
      onListUpdate,
      parentEntity,
      childIdsKey,
      childEntityName,
    ]
  )

  const handleDelete = useCallback(
    async (item: AutocompleteOption) => {
      console.log("➖ Deleting child:", item.name, item.id)
      // Locally update childEntities immediately
      const updatedEntities = childEntities.filter(
        entity => entity.id !== item.id
      )
      setChildEntities(updatedEntities)
      // Use the updated entities list to build the new IDs array
      const newChildIds = updatedEntities.map(entity => entity.id)

      console.log("➖ Updated local entities, new IDs:", newChildIds)
      // Update lastFetchedIds immediately to prevent broadcasts from overwriting
      lastFetchedIdsRef.current = newChildIds

      try {
        console.log("➖ Calling onListUpdate...")
        await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
        console.log("➖ onListUpdate complete")
      } catch (error) {
        console.error(
          `Failed to delete ${childEntityName.toLowerCase()}:`,
          error
        )
        // Revert local update on error
        setChildEntities(prev => [
          ...prev,
          childEntities.find(entity => entity.id === item.id) || item,
        ])
        // Revert lastFetchedIds
        lastFetchedIdsRef.current = childIds
      }
    },
    [
      childIds,
      childEntities,
      onListUpdate,
      parentEntity,
      childIdsKey,
      childEntityName,
    ]
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
          excludeIds={stableExcludeIds}
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
