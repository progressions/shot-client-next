"use client"

import { Skeleton, Stack, Box } from "@mui/material"
import {
  FightFilter,
  CharacterFilter,
  VehicleFilter,
  SchtickFilter,
  WeaponFilter,
  PartyFilter,
  SiteFilter,
  CampaignFilter,
  FactionFilter,
  UserFilter,
  JunctureFilter,
  BadgeList,
  ManageButton,
} from "@/components/ui"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { useState, useEffect, useCallback } from "react"
import { paginateArray } from "@/lib"
import type {
  Fight,
} from "@/types"
import pluralize from "pluralize"

type CharacterManagerProps = {
  parentEntity: Fight
  onListUpdate?: (updatedEntity: Fight) => Promise<void>
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

const filterComponents: Record<string, React.ComponentType<any>> = {
  Character: CharacterFilter,
  Schtick: SchtickFilter,
  Weapon: WeaponFilter,
  Vehicle: VehicleFilter,
  Fight: FightFilter,
  Party: PartyFilter,
  Site: SiteFilter,
  Campaign: CampaignFilter,
  Faction: FactionFilter,
  User: UserFilter,
  Juncture: JunctureFilter,
}

export function CharacterManager({
  title,
  icon,
  description,
  parentEntity,
  childEntityName,
  onListUpdate,
  excludeIds = [],
  manage = true,
}: CharacterManagerProps) {
  const childIdsKey = `${childEntityName.toLowerCase()}_ids`
  const childIds = parentEntity[childIdsKey] || []
  const stableExcludeIds = excludeIds
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)

  const [childEntities, setChildEntities] = useState(
    parentEntity.characters || []
  )
  const { client } = useClient()
  const [open, setOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Instantiate only the required FilterComponent
  const FilterComponent = filterComponents[childEntityName] || (() => null)

  const { items: paginatedItems, meta } = paginateArray(
    childEntities,
    currentPage,
    5
  )

  const { formState, dispatchForm } = useForm<FormStateData>({
    characters: [],
    factions: [],
    archetypes: [],
    types: [],
    filters: {
      per_page: 200,
    },
  })
  const { filters } = formState.data

  useEffect(() => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: { per_page: 200 },
    })
  }, [])

  const fetchChildren = useCallback(
    async localFilters => {
      try {
        console.log("Fetching characters", localFilters)
        const response = await client.getCharacters(localFilters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "characters",
          value: response.data.characters,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "factions",
          value: response.data.factions,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "types",
          value: response.data.types,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "archetypes",
          value: response.data.archetypes,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch characters error:", error)
      }
      setLoading(false)
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    fetchChildren(filters)
  }, [filters, fetchChildren])

  const updateFilters = useCallback(
    filters => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: {
          ...formState.data.filters,
          ...filters,
        },
      })
    },
    [dispatchForm]
  )

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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage)
  }

  const actionButton = manage ? (
    <ManageButton open={open} onClick={setOpen} />
  ) : null

  console.log("Manager formState", formState)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {manage && open && (
        <FilterComponent
          formState={formState}
          omit={["search"]}
          onFiltersUpdate={updateFilters}
          onChange={handleAdd}
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
          collection="characters"
          meta={meta}
          handleDelete={handleDelete}
          handlePageChange={handlePageChange}
        />
      )}
    </Box>
  )
}
