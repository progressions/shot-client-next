"use client"

import { Box, Button, Stack } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"
import { useState, useEffect } from "react"

import { FormActions, useForm } from "@/reducers"
import {
  UserAutocomplete,
  CharacterAutocomplete,
  VehicleAutocomplete,
  PartyAutocomplete,
  JunctureAutocomplete,
  SiteAutocomplete,
  WeaponAutocomplete,
  FactionAutocomplete,
  SchtickAutocomplete,
} from "@/components/autocomplete"
import { SchtickFilter } from "@/components/schticks"
import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { ManageButton, SectionHeader } from "@/components/ui"

type FormStateData = {
  page: number
  open: boolean
  id: string | null
  selectedEntity: Entity | null
  collectionItems: Entity[]
}

type ListManagerProperties = {
  icon: React.ReactNode
  entity: Entity
  name: string
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  collection: string
  collection_ids: string
  manage?: boolean
}

export default function ListManager({
  icon,
  entity,
  name,
  update,
  title,
  description,
  collection,
  collection_ids,
  manage = true,
}: ListManagerProperties) {
    console.log("entity", entity)
    console.log("entity[collection_ids]", entity[collection_ids])
    //********
    // collectionItems: the set of items, such as Schtick[], from 'character.schticks'
    // selectedEntity: the entity selected from the autocomplete, such as Schtick
    // id: the id of the selected entity, such as Schtick.id
  const initialData = {
    collectionItems: entity[collection] || [],
    collectionIds: entity[collection_ids] || [],
    selectedEntity: null,
    page: 1,
    open: false,
  }
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>(initialData)
  const { selectedEntity, collectionIds, collectionItems, page, open } = formState.data
  const id = selectedEntity ? selectedEntity.id : null
  const sortedItems = collectionItems.sort((a, b) => {
    if (a.name && b.name) {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
  const { items, meta } = paginateArray<Entity>(sortedItems || [], page, 5)

  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  const handleAddMember = async () => {
    if (!id) return

    if (collectionIds.includes(id)) {
      alert("already a member.")
      return
    }

    try {
      const entityData = {
        ...entity,
        [collection_ids]: [...collectionIds, id],
      }
      await update(entityData)

      const updatedCollection = [...entity[collection], formState.data.selectedEntity]
      dispatchForm({
        type: FormActions.UPDATE,
        name: "collectionItems",
        value: updatedCollection,
      })
      dispatchForm({ type: FormActions.UPDATE, name: "collectionIds", value: [...collectionIds, id] })
      dispatchForm({ type: FormActions.UPDATE, name: "selectedEntity", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add. Please try again.")
    }
  }

  const handleDelete = async (item: Entity) => {
    console.log("collectionIds", collectionIds)
    if (!isStringArray(collectionIds)) {
      alert("Invalid collection data.")
      return
    }

    try {
      const formData = new FormData()
      const updatedIds = collectionIds.filter((id: string) => id !== item.id)
      const entityData = { ...entity, [collection_ids]: updatedIds }
      await update(entityData)

      dispatchForm({
        type: FormActions.UPDATE,
        name: "collectionItems",
        value: collectionItems.filter((i: Entity) => i.id !== item.id),
      })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "collectionIds",
          value: updatedIds,
        })
      dispatchForm({ type: FormActions.UPDATE, name: "selectedEntity", value: null })
    } catch (error) {
      console.error("Error removing entity member:", error)
      alert("Failed to remove.")
    }
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    dispatchForm({ type: FormActions.UPDATE, name: "page", value })
  }

  const handleAutocompleteChange = (entity: Entity | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "selectedEntity", value: entity })
  }

  const autocompleteMap: Record<string, React.ReactNode> = {
    actors: (
      <CharacterAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
    characters: (
      <CharacterAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
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
    weapons: (
      <WeaponAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={collectionIds}
        allowNone={false}
      />
    ),
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
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {autocomplete}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddMember}
              size="small"
              sx={{ height: "2.5rem", px: 2 }}
            >
              <PersonAddIcon />
            </Button>
          </Stack>
        )}
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
}
