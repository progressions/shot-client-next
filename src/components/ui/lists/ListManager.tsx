"use client"

import {
  UserAutocomplete,
  VehicleAutocomplete,
  PartyAutocomplete,
  JunctureAutocomplete,
  SiteAutocomplete,
  FactionAutocomplete,
} from "@/components/autocomplete"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import { Box, Stack } from "@mui/material"
import pluralize from "pluralize"
import { useCallback, useEffect } from "react"
import type { Entity } from "@/types"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { SchtickFilter } from "@/components/schticks"
import { WeaponFilter } from "@/components/weapons"
import { CharacterFilter } from "@/components/characters"
import { BadgeList, Button, ManageButton, SectionHeader } from "@/components/ui"
import { paginateArray } from "@/lib"

type FormStateData = {
  page: number
  open: boolean
  selectedEntity: Entity | null
  collectionItems: Entity[]
}

type ListManagerProperties = {
  icon: React.ReactNode
  entity: Entity
  title: string
  description: React.ReactNode
  updateEntity: (id: string, formData: FormData) => Promise<void>
  collection: string // plural, the property on the entity that holds the collection, e.g. "characters", "vehicles"
  collection_ids: string[] // plural, the property on the entity that holds the ids of the collection, e.g. "character_ids", "vehicle_ids"
  manage?: boolean
}

export function ListManager({
  icon,
  entity: initialEntity,
  title,
  description,
  collection,
  collection_ids,
  manage = true,
  updateEntity,
}: ListManagerProperties) {
  const { client } = useClient()

  //********
  //
  // collectionItems: the set of items, such as Schtick[], from 'character.schticks'
  // selectedEntity: the entity selected from the autocomplete, such as Schtick
  // id: the id of the selected entity, such as Schtick.id
  //
  //********
  //
  const initialData = {
    entity: initialEntity,
    selectedEntity: null,
    page: 1,
    open: false,
  }
  const { formState, dispatchForm } = useForm<FormStateData>(initialData)
  const { entity, page, open, selectedEntity } = formState.data
  const collectionItems = entity[collection] || []
  const collectionIds = entity[collection_ids] || []
  const { items, meta } = paginateArray<Entity>(collectionItems, page, 5)
  const id = selectedEntity?.id

  const getFunc = `get${collection.charAt(0).toUpperCase() + collection.slice(1)}`
  const singularEntityName = pluralize
    .singular(entity.entity_class)
    .toLowerCase()
  // const singularCollectionName = pluralize.singular(collection).toLowerCase()
  // const collectionIdsName = pluralize.singular(collection_ids).toLowerCase()

  const fetchCollection = useCallback(async () => {
    try {
      console.log({
        [`${singularEntityName}_id`]: entity.id,
      })
      console.log("fetching", collection, entity.id)
      const response = await client[getFunc]({
        [`${singularEntityName}_id`]: entity.id,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      console.log(`fetched ${collection}:`, response.data)

      const newCollection = response.data[collection] || []
      const newCollectionIds =
        newCollection.map((item: Entity) => item.id) || []

      dispatchForm({
        type: FormActions.UPDATE,
        name: "meta",
        value: response.data.meta,
      })

      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: {
          ...entity,
          [collection]: newCollection,
          [collection_ids]: newCollectionIds,
        },
      })
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error)
    }
  }, [entity, collection, client, getFunc, dispatchForm])

  useEffect(() => {
    // when the component first loads, fetch the collection items from the
    // server and store them in 'entity'
    fetchCollection()
  }, [entity.id, page])

  // TODO: Characters list isn't working right

  const handleAutocompleteChange = (entity: Entity | null) => {
    console.log("ListManager handleAutocompleteChange", entity)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedEntity",
      value: entity,
    })
  }

  const autocompleteMap: Record<string, React.ReactNode> = {
    actors: <CharacterFilter setEntity={handleAutocompleteChange} />,
    characters: <CharacterFilter setEntity={handleAutocompleteChange} />,
    vehicles: (
      <VehicleAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    parties: (
      <PartyAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    junctures: (
      <JunctureAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    sites: (
      <SiteAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    weapons: <WeaponFilter setEntity={handleAutocompleteChange} />,
    factions: (
      <FactionAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    schticks: (
      <SchtickFilter
        setEntity={handleAutocompleteChange}
        exclude={collectionIds}
      />
    ),
    players: (
      <UserAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    users: (
      <UserAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
  }

  const autocomplete = autocompleteMap[collection]

  if (!manage)
    return (
      <>
        <Box sx={{ my: 4 }}>
          <BadgeList
            items={items}
            open={open}
            handleDelete={handleDelete}
            collection={collection}
            meta={meta}
            handlePageChange={handlePageChange}
          />
        </Box>
      </>
    )

  const handleAddMember = async () => {
    const updatedEntity = {
      ...entity,
      [collection_ids]: [...collectionIds, selectedEntity.id],
    }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedEntity,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedEntity",
      value: null,
    })
    console.log("about to call updateEntity", updatedEntity)
    await updateEntity(updatedEntity)
    await fetchCollection()
  }

  const handleDelete = async (item: Entity) => {
    let found = false
    const updatedCollectionIds = collectionIds.filter((id: string) => {
      if (id === item.id && !found) {
        found = true
        return false
      }
      return true
    })
    const updatedEntity = {
      ...entity,
      [collection_ids]: updatedCollectionIds,
    }
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedEntity,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedEntity",
      value: null,
    })
    await updateEntity(updatedEntity)
    await fetchCollection()
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    dispatchForm({ type: FormActions.UPDATE, name: "page", value })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedEntity",
      value: null,
    })
  }

  const actionButton = <ManageButton open={open} dispatchForm={dispatchForm} />

  return (
    <>
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: { xs: 1, sm: 1.5 },
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <SectionHeader
            title={title}
            icon={icon}
            actions={actionButton}
            sx={{ width: "100%" }}
          >
            {description}
          </SectionHeader>
        </Box>

        {open && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ my: 2, alignItems: { xs: "flex-end", sm: "center" } }}
          >
            {autocomplete}
            <Box sx={{ pb: { xs: 1, sm: 0 } }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddMember}
                size="small"
                disabled={!selectedEntity}
                sx={{ height: "2.5rem", px: 2 }}
              >
                <PersonAddIcon />
              </Button>
            </Box>
          </Stack>
        )}
        <BadgeList
          items={items}
          open={open}
          collection={collection}
          meta={meta}
          handlePageChange={handlePageChange}
          handleDelete={handleDelete}
        />
      </Box>
    </>
  )
}
