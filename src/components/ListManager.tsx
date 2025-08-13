"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Box, Stack, Skeleton } from "@mui/material"
import { createFilterComponent, BadgeList } from "@/components/ui"
import { useClient } from "@/contexts"
import { paginateArray } from "@/lib"
import type { Entity } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"
import pluralize from "pluralize"

interface AutocompleteOption {
  id: number
  name: string
}

type ListManagerProps = {
  open: boolean
  parentEntity: Entity
  childEntityName:
    | "Character"
    | "Schtick"
    | "Weapon"
    | "Vehicle"
    | "Fight"
    | "Party"
    | "Juncture"
    | "User"
    | "Site"
    | "Campaign"
    | "Faction"
  onListUpdate: (updatedEntity: Entity) => Promise<void>
  excludeIds?: number[]
}

const collectionNames: Record<string, string> = {
  Character: "characters",
  Schtick: "schticks",
  Weapon: "weapons",
  Vehicle: "vehicles",
  Fight: "fights",
  Party: "parties",
  Juncture: "junctures",
  User: "users",
  Site: "sites",
  Campaign: "campaigns",
  Faction: "factions",
}

export function ListManager({
  open,
  parentEntity,
  childEntityName,
  onListUpdate,
  excludeIds = [],
}: ListManagerProps) {
  const { client } = useClient()
  const [childEntities, setChildEntities] = useState<AutocompleteOption[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const childIdsKey = `${childEntityName.toLowerCase()}_ids`
  const childIds = useMemo(
    () => parentEntity[childIdsKey] || [],
    [parentEntity, childIdsKey]
  )
  const stableExcludeIds = useMemo(() => excludeIds, [excludeIds])
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)

  // Instantiate only the required FilterComponent
  const FilterComponent = useMemo(
    () => createFilterComponent(filterConfigs[childEntityName]),
    [childEntityName]
  )

  const { items: paginatedItems, meta } = paginateArray(
    childEntities,
    currentPage,
    5
  )

  const fetchChildEntities = useCallback(async () => {
    // Only fetch if childIds contains IDs not in childEntities
    const missingIds = childIds.filter(
      id => !childEntities.some(entity => entity.id === id)
    )
    if (!missingIds.length) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      console.log("fetchChildEntities called", { missingIds, childEntityName })
      const response = await client[
        `get${pluralChildEntityName}` as keyof typeof client
      ]({
        ids: missingIds,
      })
      setChildEntities(prev => [
        ...prev,
        ...(response.data[collection] as AutocompleteOption[]),
      ])
    } catch (error) {
      console.error(`Failed to fetch ${collection}:`, error)
    } finally {
      setLoading(false)
    }
  }, [client, childIds, childEntityName, collection, childEntities])

  useEffect(() => {
    fetchChildEntities()
  }, [fetchChildEntities])

  const handleAdd = useCallback(
    async (child: AutocompleteOption | string | null) => {
      if (child && typeof child !== "string" && !childIds.includes(child.id)) {
        console.log("handleAdd called", { child, childIds })
        // Locally update childEntities
        setChildEntities(prev => [...prev, child])
        const newChildIds = [...childIds, child.id]
        try {
          await onListUpdate({ ...parentEntity, [childIdsKey]: newChildIds })
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
        await onListUpdate({ ...parentEntity, [childIdsKey]: newChildIds })
        setCurrentPage(1)
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

  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      console.log("handlePageChange called", { value })
      setCurrentPage(value)
    },
    []
  )

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {open && (
        <FilterComponent
          onChange={handleAdd}
          excludeIds={stableExcludeIds}
          omit={["search"]}
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
