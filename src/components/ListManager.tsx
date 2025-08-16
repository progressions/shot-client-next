"use client"
import { Skeleton, Stack, Box } from "@mui/material"
import { GenericFilter, BadgeList } from "@/components/ui"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { useMemo, useState, useEffect, useCallback } from "react"
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
  const childIds = useMemo(
    () => parentEntity[childIdsKey] || [],
    [parentEntity, childIdsKey]
  )
  const stableExcludeIds = excludeIds
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)
  const [childEntities, setChildEntities] = useState(
    parentEntity.characters || []
  )
  const { client } = useClient()
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const { items: paginatedItems, meta } = paginateArray(
    childEntities.sort((a, b) => a.name.localeCompare(b.name)),
    currentPage,
    5
  )
  const { formState, dispatchForm } = useForm<{
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }>({
    data: {
      characters: [],
      factions: [],
      archetypes: [],
      types: [],
      filters: {
        per_page: 200,
        sort: "name",
        order: "asc",
      },
    },
  })
  const { filters } = formState.data

  useEffect(() => {
    const fetchChildEntities = async () => {
      try {
        const getFunc = `get${pluralChildEntityName}` as keyof typeof client
        console.log("fetching childIds", childIds)
        const response = await client[getFunc]({
          sort: "name",
          order: "asc",
          ids: childIds,
          per_page: 200,
        })
        setChildEntities(response.data[collection] || [])
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
      value: { sort: "name", order: "asc", per_page: 200 },
    })
  }, [dispatchForm])

  const fetchChildrenForAutocomplete = useCallback(
    async (localFilters: Record<string, string | boolean | null>) => {
      try {
        console.log("Fetching children", localFilters)
        const getFunc = `get${pluralChildEntityName}` as keyof typeof client
        const response = await client[getFunc](localFilters)
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
    [client, dispatchForm, pluralChildEntityName]
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
          ...formState.data.filters,
          ...filters,
        },
      })
    },
    [dispatchForm, formState.data.filters]
  )

  const handleAdd = useCallback(
    async (child: AutocompleteOption | string | null) => {
      if (child && typeof child !== "string" && !childIds.includes(child.id)) {
        console.log("handleAdd called", { child, childIds })
        // Locally update childEntities
        setChildEntities(prev => [...prev, child])
        const newChildIds = [...childIds, child.id]
        try {
          await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
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
        }
      }
    },
    [childIds, onListUpdate, parentEntity, childIdsKey, childEntityName]
  )

  const handleDelete = useCallback(
    async (item: AutocompleteOption) => {
      console.log("handleDelete called", { item, childIds })
      // Locally update childEntities
      setChildEntities(prev => prev.filter(entity => entity.id !== item.id))
      const newChildIds = childIds.filter(
        (childId: number) => childId !== item.id
      )
      try {
        await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
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
      }
    },
    [
      childIds,
      onListUpdate,
      parentEntity,
      childIdsKey,
      childEntityName,
      childEntities,
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
